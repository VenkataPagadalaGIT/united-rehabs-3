import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

interface RichContentEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichContentEditor({ value, onChange }: RichContentEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("edit");

  const insertAtCursor = (before: string, after: string = "") => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
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
    {
      icon: Image,
      label: "Image",
      action: () => insertAtCursor("![Alt text](", "https://example.com/image.jpg)"),
    },
    {
      icon: Video,
      label: "Video Embed",
      action: () =>
        insertAtCursor(
          '\n<video src="',
          'https://example.com/video.mp4" controls class="w-full rounded-lg my-4"></video>\n'
        ),
    },
  ];

  // Simple markdown preview renderer
  const renderPreview = (content: string) => {
    return content
      .split("\n\n")
      .map((block, index) => {
        // Headers
        if (block.startsWith("## ")) {
          return (
            <h2 key={index} className="text-2xl font-bold mt-8 mb-4" id={`section-${index}`}>
              {block.replace("## ", "")}
            </h2>
          );
        }
        if (block.startsWith("### ")) {
          return (
            <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
              {block.replace("### ", "")}
            </h3>
          );
        }
        // Blockquote
        if (block.startsWith("> ")) {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground"
            >
              {block.replace("> ", "")}
            </blockquote>
          );
        }
        // Divider
        if (block.trim() === "---") {
          return <hr key={index} className="my-8 border-border" />;
        }
        // Lists
        if (block.startsWith("- ")) {
          const items = block.split("\n").filter((l) => l.startsWith("- "));
          return (
            <ul key={index} className="list-disc pl-6 my-4 space-y-2">
              {items.map((item, i) => (
                <li key={i}>{item.replace("- ", "")}</li>
              ))}
            </ul>
          );
        }
        // Numbered list
        if (/^\d+\. /.test(block)) {
          const items = block.split("\n").filter((l) => /^\d+\. /.test(l));
          return (
            <ol key={index} className="list-decimal pl-6 my-4 space-y-2">
              {items.map((item, i) => (
                <li key={i}>{item.replace(/^\d+\. /, "")}</li>
              ))}
            </ol>
          );
        }
        // Image
        const imageMatch = block.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          return (
            <figure key={index} className="my-6">
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
        // Video embed
        if (block.includes("<video")) {
          return (
            <div
              key={index}
              className="my-6"
              dangerouslySetInnerHTML={{ __html: block }}
            />
          );
        }
        // Regular paragraph with inline formatting
        let text = block;
        // Bold
        text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        // Italic
        text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        // Code
        text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded">$1</code>');
        // Links
        text = text.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="text-primary underline hover:no-underline" target="_blank">$1</a>'
        );

        return (
          <p
            key={index}
            className="mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        );
      });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b bg-muted/30 px-2">
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

---

### Another Section

1. Numbered item
2. Another item"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0 p-6 min-h-[400px] prose prose-lg max-w-none">
          {value ? renderPreview(value) : (
            <p className="text-muted-foreground">Nothing to preview yet...</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
