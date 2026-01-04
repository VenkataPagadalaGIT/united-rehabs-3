import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Image,
  Video,
  Quote,
  Code,
  Minus,
  Blocks,
} from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { ShortcodeLibrary, renderShortcodes } from "./ShortcodeRenderer";

interface RichContentEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichContentEditor({ value, onChange }: RichContentEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [shortcodeSheetOpen, setShortcodeSheetOpen] = useState(false);

  const insertAtCursor = (before: string, after: string = "") => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleImageInsert = (url: string, alt?: string) => {
    insertAtCursor(`\n![${alt || "Image"}](${url})\n`, "");
    setImageDialogOpen(false);
  };

  const handleShortcodeInsert = (syntax: string) => {
    insertAtCursor(`\n${syntax}\n`, "");
    setShortcodeSheetOpen(false);
  };

  const toolbarActions = [
    { icon: Bold, label: "Bold", action: () => insertAtCursor("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertAtCursor("*", "*") },
    { icon: Heading2, label: "Heading 2", action: () => insertAtCursor("\n## ", "\n") },
    { icon: Heading3, label: "Heading 3", action: () => insertAtCursor("\n### ", "\n") },
    { icon: List, label: "Bullet List", action: () => insertAtCursor("\n- ", "") },
    { icon: ListOrdered, label: "Numbered List", action: () => insertAtCursor("\n1. ", "") },
    { icon: Quote, label: "Quote", action: () => insertAtCursor("\n> ", "\n") },
    { icon: Code, label: "Code", action: () => insertAtCursor("`", "`") },
    { icon: Minus, label: "Divider", action: () => insertAtCursor("\n---\n", "") },
    {
      icon: Link,
      label: "Link",
      action: () => insertAtCursor("[Link Text](", "https://example.com)"),
    },
  ];

  // Enhanced preview renderer
  const renderPreview = (content: string) => {
    // First, handle shortcodes
    const elements = renderShortcodes(content);

    return elements.map((element, index) => {
      if (typeof element !== "string") {
        return element;
      }

      // Process text content as markdown
      return element.split("\n\n").map((block, blockIndex) => {
        const key = `${index}-${blockIndex}`;

        if (block.startsWith("## ")) {
          return (
            <h2 key={key} className="text-2xl font-bold mt-8 mb-4">
              {block.replace("## ", "")}
            </h2>
          );
        }
        if (block.startsWith("### ")) {
          return (
            <h3 key={key} className="text-xl font-semibold mt-6 mb-3">
              {block.replace("### ", "")}
            </h3>
          );
        }
        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={key}
              className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground"
            >
              {block.replace("> ", "")}
            </blockquote>
          );
        }
        if (block.trim() === "---") {
          return <hr key={key} className="my-8 border-border" />;
        }
        if (block.startsWith("- ")) {
          const items = block.split("\n").filter((l) => l.startsWith("- "));
          return (
            <ul key={key} className="list-disc pl-6 my-4 space-y-2">
              {items.map((item, i) => (
                <li key={i}>{item.replace("- ", "")}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\. /.test(block)) {
          const items = block.split("\n").filter((l) => /^\d+\. /.test(l));
          return (
            <ol key={key} className="list-decimal pl-6 my-4 space-y-2">
              {items.map((item, i) => (
                <li key={i}>{item.replace(/^\d+\. /, "")}</li>
              ))}
            </ol>
          );
        }
        const imageMatch = block.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          return (
            <figure key={key} className="my-6">
              <img
                src={imageMatch[2]}
                alt={imageMatch[1]}
                className="w-full rounded-lg"
              />
              {imageMatch[1] && (
                <figcaption className="text-sm text-muted-foreground text-center mt-2">
                  {imageMatch[1]}
                </figcaption>
              )}
            </figure>
          );
        }

        // Skip empty blocks
        if (!block.trim()) return null;

        let text = block;
        text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded">$1</code>');
        text = text.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="text-primary underline hover:no-underline" target="_blank">$1</a>'
        );

        return (
          <p
            key={key}
            className="mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      });
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b bg-muted/30 px-2 gap-2">
          <div className="flex items-center gap-1 py-2 overflow-x-auto">
            {toolbarActions.map((action, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={action.action}
                title={action.label}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            ))}

            {/* Image Upload Dialog */}
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Insert Image"
                >
                  <Image className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Image</DialogTitle>
                </DialogHeader>
                <ImageUploader
                  onImageInsert={handleImageInsert}
                  onClose={() => setImageDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Video embed */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                insertAtCursor(
                  '\n<video src="',
                  'https://example.com/video.mp4" controls class="w-full rounded-lg my-4"></video>\n'
                )
              }
              title="Insert Video"
            >
              <Video className="h-4 w-4" />
            </Button>

            {/* Shortcode Library Sheet */}
            <Sheet open={shortcodeSheetOpen} onOpenChange={setShortcodeSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 gap-1"
                  title="Shortcodes"
                >
                  <Blocks className="h-4 w-4" />
                  <span className="text-xs hidden sm:inline">Shortcodes</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Shortcode Library</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ShortcodeLibrary onInsert={handleShortcodeInsert} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger value="edit" className="text-xs">
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="m-0">
          <Textarea
            id="content-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={20}
            className="border-0 rounded-none font-mono text-sm resize-none focus-visible:ring-0"
            placeholder="Write your content here using Markdown...

## Example Heading

This is a paragraph with **bold** and *italic* text.

- Bullet point 1
- Bullet point 2

![Image description](https://example.com/image.jpg)

> This is a blockquote

Use [cta-helpline] to add a call-to-action!

---

### Another Section

1. Numbered item
2. Another item"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0 p-6 min-h-[400px] max-w-none">
          {value ? renderPreview(value) : (
            <p className="text-muted-foreground">Nothing to preview yet...</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
