import { useState, useRef, useEffect, useCallback } from "react";
import { Share2, Copy, Check, Headphones, Play, Pause, Square } from "lucide-react";

interface ArticleToolbarProps {
  title: string;
  url: string;
  content: string;
  readTime?: string;
}

export function ArticleToolbar({ title, url, content, readTime }: ArticleToolbarProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const aiPrompt = encodeURIComponent(`Read and summarize this article: ${url} - "${title}"`);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAI, setCopiedAI] = useState(false);

  // --- TTS state ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ttsDuration, setTtsDuration] = useState("");
  const [showPlayer, setShowPlayer] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);

  const plainText = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const wordCount = plainText.split(/\s+/).length;
  const estimatedMinutes = Math.ceil(wordCount / 150);
  const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startProgressTracker = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const pct = Math.min(100, (elapsed / totalDurationRef.current) * 100);
      setProgress(pct);
      const remaining = Math.max(0, totalDurationRef.current - elapsed);
      const mins = Math.floor(remaining / 60);
      const secs = Math.floor(remaining % 60);
      setTtsDuration(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    }, 500);
  }, []);

  const togglePlay = () => {
    if (!hasTTS) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      startProgressTracker();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Samantha") || v.name.includes("Google") || v.name.includes("Natural"));
    if (preferred) utterance.voice = preferred;

    totalDurationRef.current = estimatedMinutes * 60;
    startTimeRef.current = Date.now();

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    setShowPlayer(true);
    startProgressTracker();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyAI = () => {
    navigator.clipboard.writeText(url);
    setCopiedAI(true);
    setTimeout(() => setCopiedAI(false), 2000);
  };

  const btnClass = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary hover:text-primary text-sm font-medium transition-all duration-200";

  return (
    <div className="bg-card border rounded-xl p-4 my-6" data-testid="article-toolbar">
      {/* Row 1: Listen + Social Share */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Listen */}
        {hasTTS && (
          <button
            onClick={() => { if (!showPlayer) setShowPlayer(true); togglePlay(); }}
            aria-label={isPlaying ? (isPaused ? "Resume audio" : "Pause audio") : "Listen to article"}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {isPlaying && !isPaused ? <Pause className="h-4 w-4" /> : <Headphones className="h-4 w-4" />}
            {isPlaying ? (isPaused ? "Resume" : "Pause") : `Listen (${estimatedMinutes} min)`}
          </button>
        )}

        {/* Divider */}
        {hasTTS && <div className="w-px h-5 bg-border hidden sm:block" />}

        {/* Social Share */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.1em] mr-1">Share</span>
          <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className={btnClass}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className={btnClass}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className={btnClass}>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </a>
          <button onClick={handleCopyLink} className={btnClass}>
            {copiedLink ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedLink ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* TTS Progress Bar (shown when playing) */}
      {showPlayer && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
          <button onClick={togglePlay} aria-label={isPlaying && !isPaused ? "Pause" : "Play"} className="shrink-0 w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-muted transition-colors">
            {isPlaying && !isPaused ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground font-mono w-12 text-right">
            {ttsDuration || `${String(estimatedMinutes).padStart(2, "0")}:00`}
          </span>
          {isPlaying && (
            <button onClick={stopSpeech} aria-label="Stop audio" className="text-muted-foreground hover:text-foreground transition-colors">
              <Square className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Row 2: Share with AI */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.1em] mr-1 flex items-center gap-1.5">
          <Share2 className="h-3.5 w-3.5 text-primary" /> Share with AI
        </span>
        <a href={`https://chatgpt.com/?q=${aiPrompt}`} target="_blank" rel="noopener noreferrer" className={btnClass}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>
          ChatGPT
        </a>
        <a href={`https://www.perplexity.ai/search?q=${encodedTitle}+${encodedUrl}`} target="_blank" rel="noopener noreferrer" className={btnClass}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L7.5 5.5v4L3 5v9l4.5 4.5v4L12 18l4.5 4.5v-4L21 14V5l-4.5 4.5v-4L12 1zm0 3.17L14.33 6.5H9.67L12 4.17zM4.5 7.33l3 3-3 3v-6zm15 0v6l-3-3 3-3zM9 10h6v1.5l-3 3-3-3V10zm-4.17 3.5L7.5 16.17v-5.34l-2.67 2.67zm14.34 0L16.5 10.83v5.34l2.67-2.67zM9 15.83L11.17 18H9v-2.17zm6 0V18h-2.17L15 15.83z"/></svg>
          Perplexity
        </a>
        <a href={`https://gemini.google.com/app?q=${aiPrompt}`} target="_blank" rel="noopener noreferrer" className={btnClass}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
          Gemini
        </a>
        <button onClick={handleCopyAI} className={btnClass}>
          {copiedAI ? <Check className="h-3.5 w-3.5 text-green-500" /> : <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
          {copiedAI ? "Copied!" : "Copy URL"}
        </button>
      </div>
    </div>
  );
}
