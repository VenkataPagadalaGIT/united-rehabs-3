import { useState } from "react";
import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockNavItems, mockFooterLinks } from "@/data/mockData";
import { Helmet } from "react-helmet-async";

// UI Components
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

// Custom components
import { CrisisHotlineBanner } from "@/components/CrisisHotlineBanner";
import { AffiliateDisclosureBanner } from "@/components/AffiliateDisclosureBanner";

// Icons
import {
  AlertCircle, Bell, Bold, Check, ChevronRight, Copy, Download, Eye, Heart,
  Info, Italic, Loader2, Mail, Menu, Plus, Search, Settings, Star, Terminal,
  Trash2, Upload, User, X, Palette, Layout, Type, ToggleLeft, MousePointer,
  FormInput, Table2, MessageSquare, Navigation, Layers, Shield
} from "lucide-react";

/* ─── Section wrapper ────────────────────────────── */
function Section({ id, title, icon: Icon, description, children }: {
  id: string; title: string; icon: React.ElementType; description: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pb-10 border-b border-border">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6 ml-11">{description}</p>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Demo({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      <div className="bg-card border rounded-xl p-6">{children}</div>
    </div>
  );
}

/* ─── Sidebar nav ────────────────────────────────── */
const NAV_SECTIONS = [
  { id: "buttons", label: "Buttons", icon: MousePointer },
  { id: "badges", label: "Badges", icon: Palette },
  { id: "inputs", label: "Inputs", icon: FormInput },
  { id: "selects", label: "Selects & Toggles", icon: ToggleLeft },
  { id: "cards", label: "Cards", icon: Layout },
  { id: "alerts", label: "Alerts & Banners", icon: AlertCircle },
  { id: "dialogs", label: "Dialogs & Sheets", icon: MessageSquare },
  { id: "typography", label: "Typography", icon: Type },
  { id: "tables", label: "Tables", icon: Table2 },
  { id: "navigation", label: "Navigation", icon: Navigation },
  { id: "feedback", label: "Feedback & Loading", icon: Loader2 },
  { id: "data-display", label: "Data Display", icon: Layers },
  { id: "overlays", label: "Overlays & Popovers", icon: Eye },
  { id: "custom", label: "Custom Components", icon: Shield },
];

export default function ComponentLibraryPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sliderVal, setSliderVal] = useState([33]);
  const [switchOn, setSwitchOn] = useState(true);
  const [progress, setProgress] = useState(66);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Component Library | United Rehabs</title>
      </Helmet>
      <Header navItems={mockNavItems} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Component Library</h1>
                <p className="text-sm text-muted-foreground">
                  47 UI components + 30+ custom components &middot; shadcn/ui + Radix UI + Tailwind
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
            {/* Sidebar Nav */}
            <aside className="hidden lg:block">
              <nav className="sticky top-24 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-2">Components</p>
                {NAV_SECTIONS.map(s => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                  >
                    <s.icon className="h-3.5 w-3.5" />
                    {s.label}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="space-y-10">

              {/* ═══ BUTTONS ═══ */}
              <Section id="buttons" title="Buttons" icon={MousePointer} description="Interactive button components with 6 variants and multiple sizes.">
                <Demo title="Variants">
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </Demo>
                <Demo title="Sizes">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                </Demo>
                <Demo title="States">
                  <div className="flex flex-wrap gap-3">
                    <Button disabled>Disabled</Button>
                    <Button><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading</Button>
                    <Button><Download className="h-4 w-4 mr-2" /> With Icon</Button>
                    <Button><Mail className="h-4 w-4 mr-2" /> Login with Email</Button>
                  </div>
                </Demo>
              </Section>

              {/* ═══ BADGES ═══ */}
              <Section id="badges" title="Badges" icon={Palette} description="Small labels for status, categories, and tags.">
                <Demo title="Variants">
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </Demo>
                <Demo title="Usage Examples">
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-red-600">Fentanyl</Badge>
                    <Badge className="bg-blue-600">Policy</Badge>
                    <Badge className="bg-green-600">Treatment</Badge>
                    <Badge className="bg-purple-600">DEA</Badge>
                    <Badge className="bg-amber-600">Drug Seizure</Badge>
                    <Badge variant="outline" className="gap-1"><Star className="h-3 w-3" /> Featured</Badge>
                    <Badge variant="outline" className="gap-1"><Check className="h-3 w-3" /> Verified</Badge>
                  </div>
                </Demo>
              </Section>

              {/* ═══ INPUTS ═══ */}
              <Section id="inputs" title="Inputs" icon={FormInput} description="Form input components for text, search, and multi-line content.">
                <Demo title="Text Input">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="search">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="search" placeholder="Search..." className="pl-9" />
                      </div>
                    </div>
                  </div>
                </Demo>
                <Demo title="Textarea">
                  <Textarea placeholder="Write your message here..." className="max-w-md" rows={3} />
                </Demo>
                <Demo title="Input States">
                  <div className="flex flex-wrap gap-4 max-w-xl">
                    <Input placeholder="Default" className="max-w-[200px]" />
                    <Input placeholder="Disabled" disabled className="max-w-[200px]" />
                    <Input placeholder="With value" defaultValue="Hello" className="max-w-[200px]" />
                  </div>
                </Demo>
              </Section>

              {/* ═══ SELECTS & TOGGLES ═══ */}
              <Section id="selects" title="Selects & Toggles" icon={ToggleLeft} description="Selection controls: dropdowns, checkboxes, radios, switches, sliders.">
                <Demo title="Select">
                  <Select>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select a state..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ca">California</SelectItem>
                      <SelectItem value="tx">Texas</SelectItem>
                      <SelectItem value="fl">Florida</SelectItem>
                      <SelectItem value="ny">New York</SelectItem>
                    </SelectContent>
                  </Select>
                </Demo>
                <Demo title="Checkbox & Radio">
                  <div className="flex gap-12">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2"><Checkbox id="c1" defaultChecked /><Label htmlFor="c1">Inpatient</Label></div>
                      <div className="flex items-center gap-2"><Checkbox id="c2" /><Label htmlFor="c2">Outpatient</Label></div>
                      <div className="flex items-center gap-2"><Checkbox id="c3" /><Label htmlFor="c3">Detox</Label></div>
                    </div>
                    <RadioGroup defaultValue="all">
                      <div className="flex items-center gap-2"><RadioGroupItem value="all" id="r1" /><Label htmlFor="r1">All States</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="us" id="r2" /><Label htmlFor="r2">US Only</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="intl" id="r3" /><Label htmlFor="r3">International</Label></div>
                    </RadioGroup>
                  </div>
                </Demo>
                <Demo title="Switch & Slider">
                  <div className="space-y-6 max-w-sm">
                    <div className="flex items-center gap-3">
                      <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
                      <Label>Published: {switchOn ? "Yes" : "No"}</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Progress: {sliderVal[0]}%</Label>
                      <Slider value={sliderVal} onValueChange={setSliderVal} max={100} step={1} />
                    </div>
                  </div>
                </Demo>
                <Demo title="Toggle">
                  <div className="flex gap-2">
                    <Toggle aria-label="Bold"><Bold className="h-4 w-4" /></Toggle>
                    <Toggle aria-label="Italic"><Italic className="h-4 w-4" /></Toggle>
                    <Toggle aria-label="Underline" pressed><Type className="h-4 w-4" /></Toggle>
                  </div>
                </Demo>
              </Section>

              {/* ═══ CARDS ═══ */}
              <Section id="cards" title="Cards" icon={Layout} description="Container components for grouping related content.">
                <Demo title="Basic Cards">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Treatment Centers</CardTitle>
                        <CardDescription>Find rehab facilities near you</CardDescription>
                      </CardHeader>
                      <CardContent><p className="text-2xl font-bold">14,893</p><p className="text-xs text-muted-foreground">Centers nationwide</p></CardContent>
                      <CardFooter><Button size="sm" variant="outline">Browse</Button></CardFooter>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Overdose Deaths</CardTitle>
                        <CardDescription>2025 CDC provisional data</CardDescription>
                      </CardHeader>
                      <CardContent><p className="text-2xl font-bold text-destructive">81,432</p><p className="text-xs text-muted-foreground">-12% from 2024</p></CardContent>
                    </Card>
                    <Card className="border-primary/30 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Get Help Now</CardTitle>
                      </CardHeader>
                      <CardContent><p className="text-sm text-muted-foreground">Free, confidential support 24/7</p></CardContent>
                      <CardFooter><Button size="sm">Call 1-800-662-4357</Button></CardFooter>
                    </Card>
                  </div>
                </Demo>
              </Section>

              {/* ═══ ALERTS ═══ */}
              <Section id="alerts" title="Alerts & Banners" icon={AlertCircle} description="Status messages, warnings, and notification banners.">
                <Demo title="Alert Variants">
                  <div className="space-y-3 max-w-lg">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Info</AlertTitle>
                      <AlertDescription>Data updated from CDC WONDER database, March 2026.</AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>Fentanyl test strips may not detect all synthetic opioids.</AlertDescription>
                    </Alert>
                    <Alert className="border-green-500/30 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200">
                      <Check className="h-4 w-4" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>Article published successfully.</AlertDescription>
                    </Alert>
                  </div>
                </Demo>
              </Section>

              {/* ═══ DIALOGS ═══ */}
              <Section id="dialogs" title="Dialogs & Sheets" icon={MessageSquare} description="Modal dialogs and slide-out panels.">
                <Demo title="Dialog & Sheet">
                  <div className="flex gap-3">
                    <Dialog>
                      <DialogTrigger asChild><Button variant="outline">Open Dialog</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Action</DialogTitle>
                          <DialogDescription>Are you sure you want to publish this article?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button>Publish</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Sheet>
                      <SheetTrigger asChild><Button variant="outline"><Menu className="h-4 w-4 mr-2" /> Open Sheet</Button></SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Navigation</SheetTitle>
                          <SheetDescription>Browse all sections</SheetDescription>
                        </SheetHeader>
                        <div className="py-4 space-y-3">
                          {["Home", "Drug Laws", "News", "Compare", "About"].map(item => (
                            <div key={item} className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted cursor-pointer text-sm">{item}</div>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </Demo>
              </Section>

              {/* ═══ TYPOGRAPHY ═══ */}
              <Section id="typography" title="Typography" icon={Type} description="Text styles, headings, and content formatting.">
                <Demo title="Headings & Text">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight">Heading 1 - Page Title</h1>
                    <h2 className="text-3xl font-bold tracking-tight">Heading 2 - Section</h2>
                    <h3 className="text-2xl font-semibold">Heading 3 - Subsection</h3>
                    <h4 className="text-xl font-semibold">Heading 4 - Card Title</h4>
                    <p className="text-base text-muted-foreground leading-relaxed">Body text - The opioid crisis continues to affect communities across the United States, with synthetic opioids accounting for 79% of overdose deaths in 2025.</p>
                    <p className="text-sm text-muted-foreground">Small text - Data sourced from CDC WONDER database</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Caption / Label</p>
                  </div>
                </Demo>
                <Demo title="Prose Content">
                  <div className="prose prose-slate max-w-none prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
                    <p>According to the <strong>CDC</strong>, overdose deaths involving synthetic opioids rose <strong>12%</strong> in 2025. Programs like <a href="#">naloxone distribution</a> have shown significant impact in reducing fatalities.</p>
                    <blockquote>"Every naloxone kit in a community is a potential life saved." - Dame Carol Black</blockquote>
                  </div>
                </Demo>
              </Section>

              {/* ═══ TABLES ═══ */}
              <Section id="tables" title="Tables" icon={Table2} description="Data tables for statistics and comparisons.">
                <Demo title="Data Table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>State</TableHead>
                        <TableHead>Overdose Deaths</TableHead>
                        <TableHead>Rate per 100K</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { state: "California", deaths: "8,124", rate: "20.3", change: "-8%" },
                        { state: "Florida", deaths: "7,891", rate: "35.2", change: "-15%" },
                        { state: "Ohio", deaths: "4,521", rate: "38.7", change: "-22%" },
                        { state: "West Virginia", deaths: "1,023", rate: "57.1", change: "-5%" },
                      ].map(r => (
                        <TableRow key={r.state}>
                          <TableCell className="font-medium">{r.state}</TableCell>
                          <TableCell>{r.deaths}</TableCell>
                          <TableCell>{r.rate}</TableCell>
                          <TableCell className="text-right text-green-600">{r.change}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Demo>
              </Section>

              {/* ═══ NAVIGATION ═══ */}
              <Section id="navigation" title="Navigation" icon={Navigation} description="Tabs, accordions, and breadcrumbs.">
                <Demo title="Tabs">
                  <Tabs defaultValue="stats" className="max-w-md">
                    <TabsList>
                      <TabsTrigger value="stats">Statistics</TabsTrigger>
                      <TabsTrigger value="rehabs">Rehabs</TabsTrigger>
                      <TabsTrigger value="resources">Resources</TabsTrigger>
                    </TabsList>
                    <TabsContent value="stats" className="pt-4"><p className="text-sm text-muted-foreground">Substance abuse statistics for this state.</p></TabsContent>
                    <TabsContent value="rehabs" className="pt-4"><p className="text-sm text-muted-foreground">Browse treatment centers near you.</p></TabsContent>
                    <TabsContent value="resources" className="pt-4"><p className="text-sm text-muted-foreground">Free helplines and resources.</p></TabsContent>
                  </Tabs>
                </Demo>
                <Demo title="Accordion">
                  <Accordion type="single" collapsible className="max-w-md">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is fentanyl?</AccordionTrigger>
                      <AccordionContent>Fentanyl is a synthetic opioid that is 50-100 times more potent than morphine. It is a leading cause of overdose deaths in the United States.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>What is naloxone?</AccordionTrigger>
                      <AccordionContent>Naloxone (Narcan) is a medication that rapidly reverses opioid overdose by blocking opioid receptors in the brain.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>How can I find treatment?</AccordionTrigger>
                      <AccordionContent>Call SAMHSA's National Helpline at 1-800-662-4357 for free, confidential treatment referrals 24/7.</AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Demo>
              </Section>

              {/* ═══ FEEDBACK ═══ */}
              <Section id="feedback" title="Feedback & Loading" icon={Loader2} description="Progress indicators, skeletons, and loading states.">
                <Demo title="Progress Bar">
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span>Data completeness</span><span>{progress}%</span></div>
                      <Progress value={progress} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm"><span>Upload</span><span>33%</span></div>
                      <Progress value={33} />
                    </div>
                  </div>
                </Demo>
                <Demo title="Skeleton Loading">
                  <div className="space-y-4 max-w-sm">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  </div>
                </Demo>
                <Demo title="Avatars">
                  <div className="flex gap-3">
                    <Avatar><AvatarImage src="https://ui-avatars.com/api/?name=United+Rehabs&background=c41e3a&color=fff" /><AvatarFallback>UR</AvatarFallback></Avatar>
                    <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
                    <Avatar><AvatarFallback className="bg-primary text-primary-foreground">CD</AvatarFallback></Avatar>
                    <Avatar><AvatarFallback className="bg-blue-600 text-white">DT</AvatarFallback></Avatar>
                  </div>
                </Demo>
              </Section>

              {/* ═══ DATA DISPLAY ═══ */}
              <Section id="data-display" title="Data Display" icon={Layers} description="Calendar, scroll areas, and separators.">
                <Demo title="Calendar">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border w-fit" />
                </Demo>
                <Demo title="Scroll Area">
                  <ScrollArea className="h-40 w-64 rounded-md border p-4">
                    {["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky"].map(state => (
                      <div key={state} className="py-1.5 text-sm border-b border-border last:border-0">{state}</div>
                    ))}
                  </ScrollArea>
                </Demo>
                <Demo title="Separator">
                  <div className="max-w-sm space-y-3">
                    <p className="text-sm font-medium">Section A</p>
                    <Separator />
                    <p className="text-sm font-medium">Section B</p>
                    <Separator />
                    <p className="text-sm font-medium">Section C</p>
                  </div>
                </Demo>
              </Section>

              {/* ═══ OVERLAYS ═══ */}
              <Section id="overlays" title="Overlays & Popovers" icon={Eye} description="Tooltips, popovers, and hover cards.">
                <Demo title="Tooltip, Popover, HoverCard">
                  <div className="flex flex-wrap gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild><Button variant="outline" size="sm">Hover me</Button></TooltipTrigger>
                        <TooltipContent><p>This is a tooltip</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Popover>
                      <PopoverTrigger asChild><Button variant="outline" size="sm">Open Popover</Button></PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Quick Stats</h4>
                          <p className="text-xs text-muted-foreground">81,432 overdose deaths in 2025</p>
                          <p className="text-xs text-muted-foreground">Source: CDC WONDER</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <HoverCard>
                      <HoverCardTrigger asChild><Button variant="link" className="px-0">@unitedrehabs</Button></HoverCardTrigger>
                      <HoverCardContent className="w-64">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10"><AvatarFallback>UR</AvatarFallback></Avatar>
                          <div>
                            <h4 className="text-sm font-semibold">United Rehabs</h4>
                            <p className="text-xs text-muted-foreground">Global addiction statistics covering 195 countries.</p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </Demo>
              </Section>

              {/* ═══ CUSTOM COMPONENTS ═══ */}
              <Section id="custom" title="Custom Components" icon={Shield} description="Business-specific components built for United Rehabs.">
                <Demo title="Crisis Hotline Banner">
                  <CrisisHotlineBanner />
                </Demo>
                <Demo title="Affiliate Disclosure">
                  <AffiliateDisclosureBanner />
                </Demo>
                <Demo title="Component Inventory">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {[
                      { cat: "UI Base", count: 47, color: "bg-blue-100 text-blue-700" },
                      { cat: "Home", count: 14, color: "bg-green-100 text-green-700" },
                      { cat: "Listing", count: 18, color: "bg-purple-100 text-purple-700" },
                      { cat: "Article", count: 5, color: "bg-amber-100 text-amber-700" },
                      { cat: "Auth", count: 3, color: "bg-red-100 text-red-700" },
                      { cat: "Admin", count: 3, color: "bg-gray-100 text-gray-700" },
                      { cat: "Root Custom", count: 10, color: "bg-pink-100 text-pink-700" },
                    ].map(c => (
                      <div key={c.cat} className={`rounded-lg px-3 py-2 ${c.color}`}>
                        <span className="font-semibold">{c.count}</span> {c.cat}
                      </div>
                    ))}
                  </div>
                </Demo>
              </Section>

            </div>
          </div>
        </div>
      </main>

      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
