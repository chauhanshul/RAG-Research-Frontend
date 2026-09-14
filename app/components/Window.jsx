"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Bot,
  User,
  MessageSquare,
  Globe,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
} from "lucide-react";
import api from "@/app/lib/api";
import { useApp } from "@/app/context/AppContext";

export default function Window() {
  const { selectedDatasetId, selectedSessionId } = useApp();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch session history when selectedSessionId changes
  useEffect(() => {
    if (!selectedSessionId) return;

    const fetchSessionHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/sessions/${selectedSessionId}`);
        if (res.data && res.data.messages) {
          const formatted = res.data.messages.map((m) => ({
            type: m.role,
            text: m.content,
            sources: m.sources,
          }));
          setMessages(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch session history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionHistory();
  }, [selectedSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const toggleSourceExpand = (msgIndex) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgIndex]: !prev[msgIndex],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || sending) {
      return;
    }

    const currentQuestion = question.trim();
    setQuestion("");

    // Optimistically append user message
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: currentQuestion,
      },
    ]);

    try {
      setSending(true);

      const res = await api.post("/query/answer", {
        dataset_id: selectedDatasetId,
        question: currentQuestion,
        session_id: selectedSessionId,
      });

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: res.data.answer,
          sources: res.data.sources,
          source_type: res.data.source_type,
          web_fallback_used: res.data.web_fallback_used,
        },
      ]);
    } catch (error) {
      console.error("Failed to get answer:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: "Sorry, an error occurred while generating the answer. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Chat Window Top Bar */}
      <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span className="text-xs md:text-sm font-medium text-zinc-200">
            Session {selectedSessionId?.slice(0, 8)}
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
          Multi-Turn Corrective RAG
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="text-xs">Loading conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-zinc-200 text-sm md:text-base">
              Start your research conversation
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              Ask any question about your uploaded document dataset. The system will grade relevance, search fallback sources, and format grounded citations.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
              )}

              <div
                className={`space-y-3 max-w-[85%] md:max-w-[75%] ${
                  message.type === "user"
                    ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm"
                    : "bg-zinc-900 border border-zinc-800/80 text-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3.5 text-sm shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </p>

                {/* Sources Section */}
                {message.type === "assistant" &&
                  message.sources &&
                  message.sources.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleSourceExpand(index)}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
                      >
                        {message.web_fallback_used ? (
                          <Globe className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {message.sources.length} Source
                          {message.sources.length > 1 ? "s" : ""}{" "}
                          {message.web_fallback_used ? "(Web)" : "(Local)"}
                        </span>
                        {expandedSources[index] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedSources[index] && (
                        <div className="space-y-2 pt-1">
                          {message.sources.map((src, srcIdx) => (
                            <div
                              key={srcIdx}
                              className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
                                <span className="font-semibold text-indigo-400">
                                  {src.source_id}
                                </span>
                                {src.url ? (
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:underline text-indigo-400 truncate max-w-[200px]"
                                  >
                                    {src.title || src.url}
                                  </a>
                                ) : (
                                  <span>
                                    {src.filename}
                                    {src.page ? ` (p. ${src.page})` : ""}
                                  </span>
                                )}
                              </div>
                              {src.text_snippet && (
                                <p className="text-zinc-400 text-[11px] italic leading-snug">
                                  "{src.text_snippet}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-zinc-300" />
                </div>
              )}
            </div>
          ))
        )}

        {sending && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl rounded-tl-sm px-4 py-3 text-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Searching dataset and generating answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800/80">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask something..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={sending}
            className="w-full px-4 py-3 pr-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500/80 text-zinc-100 text-sm placeholder:text-zinc-500 outline-none transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!question.trim() || sending}
            title="Send Message"
            aria-label="Send Message"
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition disabled:opacity-30 disabled:hover:bg-indigo-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}