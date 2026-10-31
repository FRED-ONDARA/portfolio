// All copy for the site lives here. Edit text and links without touching components.

export const site = {
  name: "Fredrick Ondara",
  initials: "FO",
  cv: {
    designed: "/cv/Fredrick_Ondara_CV.pdf",
    ats: "/cv/Fredrick_Ondara_CV_ATS.pdf",
  },
  seo: {
    title: "Fredrick Ondara | Electrical Engineer & Developer",
    description:
      "Telecom-focused Electrical and Electronic Engineering student in Nairobi, Kenya. Fiber optics certified, building embedded systems, robotics simulations and web products.",
  },

  loader: { label: "FREDRICK ONDARA" },

  nav: [
    { id: "about", label: "About" },
    { id: "focus", label: "Focus" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
  ],

  hero: {
    greeting: "Hi, I'm Fredrick Ondara.",
    label: "ELECTRICAL & ELECTRONIC ENGINEERING STUDENT · NAIROBI, KENYA",
    // Each entry is one staggered line. `emphasis: true` gets the accent color.
    headline: [{ text: "Building" }, { text: "what" }, { text: "connects.", emphasis: true }],
    sub: "I design embedded systems, simulate robots and ship web products. Now looking to start my career in telecommunications.",
    status: "Open to telecom internships, attachments and graduate roles",
    primaryCta: "VIEW MY WORK",
    secondaryCta: "DOWNLOAD CV",
    // Quick facts under the buttons.
    facts: [
      { value: "BSc EEE", label: "Technical University of Mombasa · 2028" },
      { value: "Certified", label: "Fiber Optics Technology" },
      { value: "Founder", label: "Globyx · numbers in 60+ countries" },
    ],
  },

  // The scrolling band under the hero.
  marquee: {
    label: "TOOLS I WORK WITH",
    items: [
      "Arduino",
      "ESP32",
      "FPGA",
      "MATLAB",
      "CoppeliaSim",
      "AutoCAD",
      "Optical fiber",
      "IoT",
      "AWS",
      "C / C++",
      "Python",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Git",
      "Figma",
      "Claude Code",
      "Antigravity",
      "Jules",
    ],
  },

  about: {
    number: "01",
    label: "ABOUT",
    heading: ["Engineer first,", "builder always."],
    body: "I'm a Bachelor of Science student in Electrical and Electronic Engineering at the Technical University of Mombasa. I'm certified in Fiber Optics Technology and I like turning ideas into working hardware, simulations and software.",
    more: "I build and ship real products, from robotics control systems to responsive web applications. I learn fast, work across hardware, software and cloud, and use modern AI tools to speed up design, debugging and documentation.",
    glance: [
      { label: "Studying", value: "BSc Electrical & Electronic Engineering, expected 2028" },
      { label: "Based in", value: "Nairobi, Kenya" },
      { label: "Languages", value: "English and Swahili, both fluent" },
      { label: "Looking for", value: "Telecom internship, attachment or graduate role" },
    ],
    facts: [
      { title: "Fiber Optics Technology", label: "Certified" },
      { title: "IEEE Student Branch", label: "Active member" },
      { title: "Robotics Team Leader", label: "University Automation Club" },
      { title: "Founder", label: "Globyx" },
    ],
  },

  focus: {
    number: "02",
    label: "FOCUS",
    heading: ["Where I", "build."],
    tabs: [
      {
        id: "telecom",
        title: "Telecom & Networks",
        body: "Optical fiber systems, IoT connectivity and cloud fundamentals (AWS in progress). The foundation I want to grow in a telecom career.",
      },
      {
        id: "robotics",
        title: "Embedded & Robotics",
        body: "Arduino, ESP32, FPGA, PCB design and servo-driven robots, simulated in MATLAB and CoppeliaSim before they touch hardware.",
      },
      {
        id: "web",
        title: "Web & AI",
        body: "React, Tailwind CSS and JavaScript/TypeScript, built alongside modern AI agents (GPT, Gemini, Claude, Antigravity, Jules) to ship faster.",
      },
    ],
  },

  skills: {
    number: "03",
    label: "SKILLS",
    heading: ["Tools I", "build with."],
    intro:
      "I work across hardware, software and cloud, and I pair that with AI agents. They help me design, debug and document faster, while I stay in charge of the engineering.",
    aiLabel: "AI-ASSISTED ENGINEERING",
    // `logo` picks the mark from src/content/logos.ts.
    ai: [
      {
        id: "claude-code",
        logo: "claude-code",
        name: "Claude Code",
        maker: "Anthropic",
        kind: "AGENTIC CODING",
        what: "Anthropic's agentic coding tool. It reads a whole codebase, plans changes, edits files and runs commands and tests from the terminal or the editor.",
        how: "This portfolio was planned, built, tested and deployed with Claude Code, from the 3D scenes and photo cutouts to the performance work and the Vercel launch.",
      },
      {
        id: "fable",
        logo: "fable",
        name: "Claude Fable 5.1",
        maker: "Anthropic",
        kind: "AI CODING AGENT",
        what: "A model in Anthropic's Claude family that I run as a coding agent on long, multi-step technical work.",
        how: "I worked on a Terminal-Bench 3 project with Fable 5.1 as the AI coding agent. Terminal-Bench tests agents on hard, realistic command-line tasks.",
      },
      {
        id: "antigravity",
        logo: "antigravity",
        name: "Google Antigravity",
        maker: "Google",
        kind: "AGENT-FIRST IDE",
        what: "Google's agent-first development environment. Agents plan the work, edit files and run the terminal, then report back with artifacts I can check.",
        how: "Part of my multi-agent workflow for coding, research and documentation, with agents working on tasks while I review the results.",
      },
      {
        id: "jules",
        logo: "jules",
        name: "Jules",
        maker: "Google",
        kind: "BACKGROUND CODING AGENT",
        what: "Google's coding agent that works in the background. You assign a task on a GitHub repository; it plans, writes the change and opens a pull request.",
        how: "I hand it well-scoped coding tasks and review the pull request it returns before anything is merged.",
      },
      {
        id: "astra",
        logo: "astra",
        name: "GPT-6 Astra",
        maker: "OpenAI",
        kind: "REASONING & COMPUTER USE",
        what: "OpenAI's newest model, released in September 2026, built for complex reasoning, coding, research and computer use.",
        how: "I use GPT models alongside Claude and Gemini to reason through problems, research topics and draft documentation.",
      },
    ],
    toolkitLabel: "TOOLKIT",
    // `logo` (optional) picks a mark from `chipLogos` in src/content/logos.ts.
    toolkit: [
      {
        title: "Telecom & Networks",
        items: [
          { name: "Optical fiber systems" },
          { name: "IoT connectivity" },
          { name: "Cloud fundamentals (AWS, in progress)" },
        ],
      },
      {
        title: "Embedded & Hardware",
        items: [
          { name: "Arduino", logo: "arduino" },
          { name: "ESP32", logo: "esp32" },
          { name: "FPGA programming" },
          { name: "Circuit & PCB design" },
          { name: "Sensor integration" },
          { name: "Serial bus servo debugging" },
        ],
      },
      {
        title: "Simulation & Control",
        items: [
          { name: "MATLAB" },
          { name: "CoppeliaSim / V-REP" },
          { name: "Fuzzy logic control" },
          { name: "AutoCAD", logo: "autocad" },
        ],
      },
      {
        title: "Programming & Web",
        items: [
          { name: "C / C++", logo: "cplusplus" },
          { name: "Python", logo: "python" },
          { name: "JavaScript / TypeScript", logo: "typescript" },
          { name: "Lua", logo: "lua" },
          { name: "HTML / CSS" },
          { name: "React", logo: "react" },
          { name: "Tailwind CSS", logo: "tailwind" },
          { name: "Bootstrap" },
          { name: "Framer Motion" },
          { name: "Git / GitHub", logo: "git" },
          { name: "Figma", logo: "figma" },
        ],
      },
      { title: "Also with AI", items: [{ name: "Gemini", logo: "gemini" }, { name: "Multi-agent workflows" }] },
      {
        title: "Ways of working",
        items: [
          { name: "Communication & teamwork" },
          { name: "Problem solving" },
          { name: "Time management" },
          { name: "Self-learning" },
        ],
      },
    ],
    processLabel: "HOW I WORK",
    process: [
      {
        title: "Simulate first",
        body: "Control logic is modelled in MATLAB and CoppeliaSim before it touches hardware.",
      },
      {
        title: "Build the hardware",
        body: "Arduino, ESP32 and FPGA boards, circuits and sensors, wired into working prototypes.",
      },
      { title: "Debug and test", body: "Hardware and firmware are debugged together, down to serial bus servos." },
      {
        title: "Ship and document",
        body: "Working products go live, and AI tools speed up the debugging and documentation.",
      },
    ],
  },

  experience: {
    number: "04",
    label: "EXPERIENCE",
    heading: ["What I've", "done so far."],
    roles: [
      {
        role: "Founder",
        org: "Globyx",
        href: "https://globyxlimited2026.vercel.app/",
        points: [
          "Founded and run an online platform offering virtual phone numbers in 60+ countries, plus residential, mobile, ISP and datacenter proxies.",
          "Customers manage their numbers and proxies from a single wallet and one dashboard.",
        ],
      },
      {
        role: "Research Assistant",
        org: "University Lab & Independent Projects",
        points: [
          "Contributed to robotics, IoT and automation research.",
          "Built and tested control systems integrating MATLAB with CoppeliaSim simulations.",
          "Debugged hardware and firmware across Arduino and serial bus servo platforms.",
        ],
      },
      {
        role: "Robotics Team Leader",
        org: "University Automation Club",
        points: ["Lead a student robotics team through planning, building and testing of automation projects."],
      },
    ],
    educationLabel: "EDUCATION",
    education: [
      {
        title: "BSc Electrical & Electronic Engineering",
        detail: "Technical University of Mombasa, Kenya · Expected graduation 2028",
      },
      { title: "High School Certificate", detail: "Distinction in Mathematics, Physics and Computer Studies" },
    ],
    certificationsLabel: "CERTIFICATIONS & MEMBERSHIP",
    certifications: [
      { title: "Fiber Optics Technology", detail: "Certified · optical communication systems and installation" },
      { title: "AWS Cloud", detail: "Ongoing study of cloud computing" },
      { title: "Web Development", detail: "Self-taught and project-based" },
      { title: "IEEE Student Branch", detail: "Active member" },
    ],
  },

  projects: {
    number: "05",
    label: "PROJECTS",
    heading: ["Selected", "work."],
    items: [
      {
        slug: "globyx",
        title: "Globyx",
        tag: "FOUNDER",
        body: [
          "My own business: an online platform offering virtual phone numbers in 60+ countries, plus residential, mobile, ISP and datacenter proxies.",
          "Customers manage all of it from a single wallet and one dashboard.",
        ],
        href: "https://globyxlimited2026.vercel.app/",
      },
      {
        slug: "matlab-coppeliasim",
        title: "MATLAB-CoppeliaSim Fusion",
        tag: "ROBOTICS",
        body: [
          "Fuzzy logic control for Pioneer P3DX robots, with MATLAB driving a CoppeliaSim simulation through Lua scripting.",
          "The result is a real-time robotics control system, tested in simulation before it touches hardware.",
        ],
      },
      {
        slug: "hiwonder-arms",
        title: "Hiwonder Robotic Arms",
        tag: "EMBEDDED",
        body: [
          "Programmable experiments on the Hiwonder xArm1S and LX-225 serial bus servos, written in Arduino and Python.",
          "Hands-on work across hardware and firmware, including debugging the serial bus servo platform.",
        ],
      },
      {
        slug: "terminal-bench-3",
        title: "Terminal-Bench 3",
        tag: "AI",
        body: [
          "Terminal-Bench 3 is a benchmark that tests AI agents on hard, realistic command-line tasks.",
          "I worked on a project for it, developed with Claude Fable 5.1 as the AI coding agent.",
        ],
      },
    ],
    more: {
      label: "More web builds",
      links: [
        { title: "Epiculean Journeys", href: "https://epicurean-journeys.vercel.app/index.html" },
        { title: "Tales Untold", href: "https://tales-untold.vercel.app/" },
      ],
    },
  },

  contact: {
    number: "06",
    label: "CONTACT",
    heading: ["Let's", "connect."],
    line: "Looking for a telecommunications team to learn from and contribute to. Say hello.",
    details: [
      { label: "Based in", value: "Nairobi, Kenya" },
      { label: "Open to", value: "Internships, attachments and graduate roles" },
      { label: "Speaks", value: "English and Swahili" },
    ],
    links: [
      // `icon` picks the brand icon from src/components/icons.tsx.
      { label: "Email", icon: "email", href: "mailto:fredrickondara01@gmail.com" },
      { label: "WhatsApp", icon: "whatsapp", href: "https://wa.me/254703589175" },
      { label: "LinkedIn", icon: "linkedin", href: "http://www.linkedin.com/in/fredrick-ondara-617570339" },
      { label: "GitHub", icon: "github", href: "https://github.com/Fredrick-Ondara-Onenga" },
    ],
    cvCta: "DOWNLOAD CV",
  },

  footer: {
    copyright: "© 2026 Fredrick Ondara",
    backToTop: "Back to top",
  },
} as const;

export type ProjectSlug = (typeof site.projects.items)[number]["slug"];
export type AiToolId = (typeof site.skills.ai)[number]["id"];
export type FocusId = (typeof site.focus.tabs)[number]["id"];
