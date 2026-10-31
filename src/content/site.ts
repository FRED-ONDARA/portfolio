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
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
  ],

  hero: {
    label: "ELECTRICAL & ELECTRONIC ENGINEERING STUDENT · NAIROBI, KENYA",
    // Each entry is one staggered line. `emphasis: true` gets the accent color.
    headline: [{ text: "Building" }, { text: "what" }, { text: "connects.", emphasis: true }],
    sub: "I design embedded systems, simulate robots and ship web products. Now looking to start my career in telecommunications.",
    status: "Open to telecom internships, attachments and graduate roles",
    primaryCta: "VIEW MY WORK",
    secondaryCta: "DOWNLOAD CV",
  },

  about: {
    number: "01",
    label: "ABOUT",
    heading: ["Engineer first,", "builder always."],
    body: "I'm a Bachelor of Science student in Electrical and Electronic Engineering at the Technical University of Mombasa. I'm certified in Fiber Optics Technology and I like turning ideas into working hardware, simulations and software.",
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

  projects: {
    number: "03",
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
    number: "04",
    label: "CONTACT",
    heading: ["Let's", "connect."],
    line: "Looking for a telecommunications team to learn from and contribute to. Say hello.",
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
export type FocusId = (typeof site.focus.tabs)[number]["id"];
