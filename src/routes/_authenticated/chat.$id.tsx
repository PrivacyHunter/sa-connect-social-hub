import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Mic,
  MoreHorizontal,
  Paperclip,
  Pin,
  Play,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentProfile } from "@/hooks/use-current-user";
import { useMediaSrc } from "@/hooks/use-media-url";
import { uploadFile } from "@/lib/media";
import { formatClockTime, formatDuration, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { CallOverlay, useCall } from "@/components/call-overlay";
import { Phone, Video } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat/$id")({
  head: () => ({
    meta: [
      { title: "Conversation — SA Connect" },
      { name: "description", content: "Your messages and shared moments on SA Connect." },
      { property: "og:title", content: "Conversation — SA Connect" },
      { property: "og:description", content: "Your messages and shared moments on SA Connect." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConversationPage,
});

function ConversationPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useCurrentProfile();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef(0);
  const call = useCall(id, me?.id);

  const conv = useQuery({
    queryKey: ["conversation", id],
    queryFn: async (): Promise<Conversation | null> => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, conversation_members(user_id, last_read_at, profiles(*))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Conversation | null;
    },
  });

  const messages = useQuery({
    queryKey: ["messages", id],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, profiles(*)")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })
        .limit(300);
      if (error) throw error;
      return data as Message[];
    },
  });

  // realtime: new messages refresh the thread + list
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${id}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["messages", id] });
          qc.invalidateQueries({ queryKey: ["conversations"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, qc]);

  // mark read + scroll to bottom
  useEffect(() => {
    if (!me) return;
    supabase
      .from("conversation_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", id)
      .eq("user_id", me.id);
  }, [id, me]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data?.length]);

  const members = conv.data?.conversation_members ?? [];
  const other = members.find((m) => m.user_id !== me?.id);
  const isDm = conv.data?.type === "dm";
  const title = isDm ? other?.profiles.display_name : conv.data?.name;
  const isChannel = conv.data?.type === "channel";
  const canPost = !isChannel || conv.data?.created_by === me?.id;

  async function send(kind: "text" | "image" | "file" | "voice", body: string | null, mediaUrl: string | null, fileName: string | null, duration: number | null) {
    if (!me) return;
    const { error } = await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: me.id,
      body,
      kind,
      media_url: mediaUrl,
      file_name: fileName,
      duration_seconds: duration,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["messages", id] });
    qc.invalidateQueries({ queryKey: ["conversations"] });
  }

  async function submitText(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText("");
    await send("text", t, null, null, null);
  }

  async function attachFile(file: File, kind: "image" | "file") {
    setBusy(true);
    try {
      const path = await uploadFile("media", file);
      await send(kind, null, path, file.name, null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];
      recordStartRef.current = Date.now();
      rec.ondataavailable = (ev) => chunksRef.current.push(ev.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const duration = Math.max(1, Math.round((Date.now() - recordStartRef.current) / 1000));
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        setBusy(true);
        try {
          const path = await uploadFile("media", file);
          await send("voice", null, path, file.name, duration);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not send voice note");
        } finally {
          setBusy(false);
        }
      };
      rec.start();
      setRecording(true);
    } catch {
      toast.error("Microphone permission needed for voice notes");
    }
  }

  async function leave() {
    if (!me) return;
    const { error } = await supabase
      .from("conversation_members")
      .delete()
      .eq("conversation_id", id)
      .eq("user_id", me.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["conversations"] });
    navigate({ to: "/chat" });
  }

  async function pinLast() {
    const last = messages.data?.[messages.data.length - 1];
    if (!last) {
      toast.error("Nothing to pin yet");
      return;
    }
    const body =
      last.kind === "text"
        ? last.body
        : last.kind === "image"
          ? "📷 Photo"
          : last.kind === "voice"
            ? "🎤 Voice note"
            : `📎 ${last.file_name ?? "File"}`;
    const { error } = await supabase
      .from("conversations")
      .update({ pinned_body: body, pinned_at: last.created_at })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["conversation", id] });
    toast.success("Announcement pinned");
  }

  const lastMessage = messages.data?.[messages.data.length - 1];

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-3xl flex-col lg:h-dvh">
      {/* header */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => navigate({ to: "/chat" })}
          aria-label="Back to chats"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {isDm && other ? (
          <UserAvatar profile={other.profiles} showOnline />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-gold">
            {isChannel ? <Pin className="h-5 w-5" /> : <Users className="h-5 w-5" />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold">{title ?? "Loading…"}</h2>
          <p className="truncate text-xs text-muted-foreground">
            {isDm
              ? other
                ? `${members.length} member · ${timeAgo(other.profiles.created_at)} joined`
                : ""
              : `${members.length} ${members.length === 1 ? "member" : "members"}${isChannel ? " · broadcast channel" : " · group"}`}
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Voice call" onClick={() => call.start(false)}>
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Video call" onClick={() => call.start(true)}>
          <Video className="h-5 w-5" />
        </Button>
        <CallOverlay call={call} title={title ?? "Call"} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Options">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isChannel && conv.data?.created_by === me?.id && (
              <DropdownMenuItem onClick={pinLast}>
                <Pin className="h-4 w-4" /> Pin latest message
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={leave}
            >
              <LogOut className="h-4 w-4" /> Leave
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* pinned announcement */}
      {isChannel && conv.data?.pinned_body && (
        <div className="flex items-start gap-2 border-b border-border bg-accent px-4 py-2 text-sm text-accent-foreground">
          <Pin className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0">
            <span className="block font-semibold">Pinned announcement</span>
            <span className="block truncate">{conv.data.pinned_body}</span>
          </span>
        </div>
      )}

      {/* messages */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.isLoading && <p className="text-sm text-muted-foreground">Loading messages…</p>}
        {messages.data?.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No messages yet — say hello 👋
          </p>
        )}
        {messages.data?.map((m) => (
          <MessageBubble key={m.id} message={m} mine={m.sender_id === me?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* composer */}
      <form onSubmit={submitText} className="flex items-center gap-2 border-t border-border p-3">
        {canPost ? (
          <>
            <input type="file" accept="image/*" className="hidden" id={`img-${id}`} onChange={(e) => { const f = e.target.files?.[0]; if (f) attachFile(f, "image"); }} />
            <input type="file" className="hidden" id={`file-${id}`} onChange={(e) => { const f = e.target.files?.[0]; if (f) attachFile(f, "file"); }} />
            <Button type="button" variant="ghost" size="icon" asChild>
              <label htmlFor={`img-${id}`} aria-label="Send image" className="cursor-pointer">
                <ImageIcon className="h-5 w-5" />
              </label>
            </Button>
            <Button type="button" variant="ghost" size="icon" asChild>
              <label htmlFor={`file-${id}`} aria-label="Send file" className="cursor-pointer">
                <Paperclip className="h-5 w-5" />
              </label>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleRecording}
              aria-label={recording ? "Stop recording" : "Record voice note"}
              className={cn(recording && "text-destructive")}
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={recording ? "Recording voice note…" : "Type a message"}
            />
            <Button type="submit" size="icon" disabled={!text.trim()} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <p className="w-full py-2 text-center text-sm text-muted-foreground">
            Only channel admins can broadcast here — this feed is read-only for subscribers.
          </p>
        )}
      </form>
    </div>
  );
}

function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  const { data: mediaSrc } = useMediaSrc(message.media_url ? "media" : null, message.media_url);
  return (
    <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
      {!mine && <UserAvatar profile={message.profiles} size="sm" />}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
          mine
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-card",
        )}
      >
        {!mine && (
          <div className="mb-0.5 text-xs font-semibold text-gold">{message.profiles.display_name}</div>
        )}
        {message.kind === "text" && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
        {message.kind === "image" &&
          (mediaSrc ? (
            <a href={mediaSrc} target="_blank" rel="noreferrer">
              <img src={mediaSrc} alt="Shared image" className="max-h-72 rounded-xl object-cover" />
            </a>
          ) : (
            <div className="h-40 w-56 animate-pulse rounded-xl bg-muted" />
          ))}
        {message.kind === "voice" && mediaSrc && (
          <div className="flex items-center gap-2 py-1">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", mine ? "bg-primary-foreground/20" : "bg-secondary")}>
              <Play className="h-4 w-4" />
            </span>
            <div>
              <audio controls src={mediaSrc} className="h-8 max-w-[220px]" preload="none" />
              <div className="text-[11px] opacity-70">Voice note · {formatDuration(message.duration_seconds)}</div>
            </div>
          </div>
        )}
        {message.kind === "file" && (
          <a
            href={mediaSrc ?? "#"}
            download={message.file_name ?? undefined}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center gap-2 rounded-xl px-2 py-1.5",
              mine ? "bg-primary-foreground/15" : "bg-secondary",
            )}
          >
            <FileText className="h-5 w-5" />
            <span className="max-w-[180px] truncate underline">{message.file_name ?? "Download file"}</span>
            <Download className="h-4 w-4" />
          </a>
        )}
        <div className={cn("mt-0.5 text-right text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {formatClockTime(message.created_at)}
        </div>
      </div>
    </div>
  );
}
