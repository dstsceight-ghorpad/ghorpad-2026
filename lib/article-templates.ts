export interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  content: Record<string, unknown>;
}

function p(text: string) {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function h(level: number, text: string) {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

function italic(text: string) {
  return {
    type: "paragraph",
    content: [
      {
        type: "text",
        text,
        marks: [{ type: "italic" }],
      },
    ],
  };
}

function bq(text: string) {
  return {
    type: "blockquote",
    content: [p(text)],
  };
}

function hr() {
  return { type: "horizontalRule" };
}

export const articleTemplates: ArticleTemplate[] = [
  {
    id: "blank",
    name: "Blank Article",
    description: "Start with a clean slate",
    icon: "FileText",
    category: "",
    content: {
      type: "doc",
      content: [p("")],
    },
  },
  {
    id: "news-report",
    name: "News Report",
    description: "Standard news format with lead, body, and quotes",
    icon: "Newspaper",
    category: "Campus",
    content: {
      type: "doc",
      content: [
        h(1, "Headline Goes Here"),
        italic("[Dateline — Location, Date]"),
        p("Write your lead paragraph here. Answer the who, what, when, where, and why in 1-2 sentences. This is the most important part of the story."),
        hr(),
        h(2, "Background"),
        p("Provide context and background information. What led to this event? Why does it matter?"),
        h(2, "Key Details"),
        p("Expand on the core facts of the story. Include specific numbers, names, and details."),
        bq("Include a relevant quote from a key source here. — Source Name, Designation"),
        h(2, "Impact"),
        p("Describe the impact or significance. What happens next? How does this affect the campus community?"),
      ],
    },
  },
  {
    id: "opinion",
    name: "Opinion / Editorial",
    description: "Structured opinion piece with thesis and arguments",
    icon: "MessageSquare",
    category: "Opinion",
    content: {
      type: "doc",
      content: [
        h(1, "Your Opinion Title"),
        italic("[State your thesis clearly in this opening paragraph. What position are you taking and why should readers care?]"),
        hr(),
        h(2, "The Current Situation"),
        p("Describe the current state of affairs. What is happening that prompted this opinion?"),
        h(2, "The Case For"),
        p("Present your strongest arguments supporting your position. Use evidence and examples."),
        h(2, "Counterpoint"),
        p("Acknowledge the opposing view fairly. Address the strongest counterarguments."),
        h(2, "Conclusion"),
        p("Restate your thesis with the weight of your arguments. End with a call to action or forward-looking statement."),
      ],
    },
  },
  {
    id: "interview",
    name: "Interview",
    description: "Q&A format with introduction",
    icon: "Mic",
    category: "Campus",
    content: {
      type: "doc",
      content: [
        h(1, "Interview: [Subject Name]"),
        italic("[Brief introduction: Who is the interviewee, what are they known for, and why is this interview timely?]"),
        hr(),
        p("**Q: Start with an icebreaker or context-setting question.**"),
        p("A: [Subject's response]"),
        p("**Q: Follow up on their response or transition to the main topic.**"),
        p("A: [Subject's response]"),
        p("**Q: Ask about challenges, lessons, or insights.**"),
        p("A: [Subject's response]"),
        p("**Q: Conclude with a forward-looking or personal question.**"),
        p("A: [Subject's response]"),
        hr(),
        italic("[Editor's note or closing context]"),
      ],
    },
  },
  {
    id: "event-coverage",
    name: "Event Coverage",
    description: "Report on campus events with highlights and photos",
    icon: "Calendar",
    category: "Campus",
    content: {
      type: "doc",
      content: [
        h(1, "Event Name — Coverage"),
        italic("[Date, Venue, Organized by]"),
        p("Opening summary: What was the event? How many attended? What was the overall atmosphere?"),
        hr(),
        h(2, "Highlights"),
        p("Describe the key moments, performances, or announcements that defined the event."),
        h(2, "Voices from the Event"),
        bq("Quote from an organizer or participant. — Name, Role"),
        bq("Quote from an attendee. — Name, Batch"),
        h(2, "Photo Descriptions"),
        italic("[Describe key photos that should accompany this article]"),
        h(2, "Looking Ahead"),
        p("What's next? Any follow-up events or outcomes expected?"),
      ],
    },
  },
  {
    id: "review",
    name: "Book / Film Review",
    description: "Structured review with rating and recommendation",
    icon: "BookOpen",
    category: "Culture",
    content: {
      type: "doc",
      content: [
        h(1, "Review: [Title]"),
        italic("[Author/Director: Name | Genre: Type | Published/Released: Date]"),
        hr(),
        h(2, "Overview"),
        p("Provide a spoiler-free summary. What is this work about? Set the scene for readers."),
        h(2, "Analysis"),
        p("What works well? Discuss themes, craftsmanship, performances, or writing quality."),
        p("What could be better? Be fair and specific in your critique."),
        h(2, "Standout Moments"),
        p("Highlight 2-3 specific scenes, chapters, or elements that left an impression."),
        h(2, "Verdict"),
        p("Your overall rating and recommendation. Who would enjoy this? Is it worth the time?"),
        italic("[Rating: X/5]"),
      ],
    },
  },
  {
    id: "profile",
    name: "Profile / Feature",
    description: "In-depth profile of a person or initiative",
    icon: "User",
    category: "Achievements",
    content: {
      type: "doc",
      content: [
        h(1, "[Subject Name]: A Profile"),
        italic("[Opening scene or anecdote that captures who this person is]"),
        hr(),
        h(2, "Background"),
        p("Where did they come from? What shaped their journey to this point?"),
        h(2, "The Journey"),
        p("Key milestones, decisions, and turning points in their career or life."),
        h(2, "In Their Own Words"),
        bq("A defining quote that captures their philosophy. — Subject Name"),
        h(2, "Impact & Legacy"),
        p("How have they influenced their field, institution, or community? What will their legacy be?"),
      ],
    },
  },
];
