// import { EROUTE_VALUE } from "@/utils/commons/routes";
// import { NEW_FEATURE_AI_ART_VIDEO } from "@/utils/constants/cdn";

// const NEW_FEATURES_OPTIONS = [
//   {
//     id: "1",
//     video: NEW_FEATURE_AI_ART_VIDEO,
//     title: "Create AI Image – turn ideas to visual in seconds",
//     desc: "From photorealistic scenes to cartoon characters, describe any image and we'll create it instantly. Give it a try!",
//   },
// ];

// const CHAT_ASSISTANT_OPTIONS = [
//   {
//     title: "Academic Writing",
//     description: "Research and Academic paper assistance",
//     type: "writing",
//     icon: "/icons/assistants/writing.svg",
//     url: EROUTE_VALUE.ASSISTANT_WRITING,
//   },
// ];

// const PERSONAL_OPTIONS = [
//   {
//     icon: "🎒",
//     name: "Student",
//     value: "student",
//   },
//   {
//     icon: "‍💼",
//     name: "Office Worker",
//     value: "office_worker",
//   },
//   {
//     icon: "‍🎙️",
//     name: "Content Creator",
//     value: "content_creator",
//   },
//   {
//     icon: "📝",
//     name: "Other",
//     value: "other",
//   },
// ];

// const INTEREST_OPTIONS = [
//   {
//     icon: "‍📚",
//     name: "Education",
//     value: "education",
//   },
//   {
//     icon: "‍‍💬",
//     name: "Communication",
//     value: "office_worker",
//   },
//   {
//     icon: "📖",
//     name: "Homework",
//     value: "homework",
//   },
//   {
//     icon: "💵",
//     name: "Personal Finance",
//     value: "personal_finance",
//   },
//   {
//     icon: "‍📧",
//     name: "Email",
//     value: "email",
//   },
//   {
//     icon: "‍📣",
//     name: "Marketing",
//     value: "marketing",
//   },
//   {
//     icon: "📈",
//     name: "Business",
//     value: "business",
//   },
//   {
//     icon: "🍎",
//     name: "Health",
//     value: "health",
//   },
//   {
//     icon: "‍💻",
//     name: "Coding",
//     value: "coding",
//   },
//   {
//     icon: "‍📱",
//     name: "Social Media",
//     value: "social_media",
//   },
//   {
//     icon: "😄",
//     name: "Fun",
//     value: "fun",
//   },
//   {
//     icon: "🎯",
//     name: "Career Development",
//     value: "career_development",
//   },
//   {
//     icon: "💡",
//     name: "Ideas",
//     value: "ideas",
//   },
// ];

// const FEEDBACKS_OPTIONS = [
//   {
//     title: "Perfect office assistant",
//     description:
//       "A game-changer! It handles tasks like drafting emails and brainstorming ideas quickly and efficiently. Highly recommended for busy professionals!",
//     author: "Ki24",
//     date: "30 Jun, 2024",
//     star: 5,
//   },
//   {
//     title: "Productivity boost",
//     description:
//       "I’m impressed with how this AI supports my workday. It saves me time by summarizing documents and answering questions quickly 👍😍😍",
//     author: "Miiite😊",
//     date: "25 May, 2024",
//     star: 5,
//   },
//   {
//     title: "Essential Tool for Busy Professionals",
//     description:
//       "Great assistant for office tasks! It helps with reports and organizing my day. There's some room for improvement, but overall, it's a valuable tool.",
//     author: "Ben Might",
//     date: "15 Apr, 2024",
//     star: 5,
//   },
//   {
//     title: "Go-to Assistant for Meeting Notes!",
//     description:
//       "It captures and summarizes meeting notes with incredible accuracy, saving me time and ensuring I never miss important details",
//     author: "thilieu1949",
//     date: "12 Feb, 2024",
//     star: 5,
//   },
//   {
//     title: "Essential Tool for Office Life",
//     description:
//       "I can't imagine my work routine without this AI chatbot. It's like having a personal assistant that helps with everything. A must-have for any office worker!",
//     author: "The Benevolent Misanthrope",
//     date: "6 Jan, 2024",
//     star: 5,
//   },
// ];

export const INTEREST_BUTTON_OPTIONS = [
  {
    icon: "/icons/career-development.svg",
    name: "Career Development",
    value: "career_development",
  },
  { icon: "/icons/work.svg", name: "For Work", value: "for_work" },
  { icon: "/icons/marketing.svg", name: "Marketing", value: "marketing" },
  { icon: "/icons/education.svg", name: "Education", value: "education" },
  { icon: "/icons/writing.svg", name: "Writing", value: "writing" },
  {
    icon: "/icons/social-media.svg",
    name: "Social Media",
    value: "social_media",
  },
  { icon: "/icons/ideas.svg", name: "Ideas", value: "ideas" },
  { icon: "/icons/fun.svg", name: "Fun", value: "fun" },
];

export const INTEREST_CATEGORY_OPTIONS = {
  career_development: [
    {
      desc: "Craft compelling resumes",
      icon: "/icons/usecases/career/resume-builder.svg",
      title: "Resume Builder",
      value: "task_resume_builder",
    },
    {
      desc: "Compose effective cover letters",
      icon: "/icons/usecases/career/cover-letter.svg",
      title: "Cover Letter",
      value: "task_cover_letter",
    },
    {
      desc: "Prepare for job interviews",
      icon: "/icons/usecases/career/interview-prepper.svg",
      title: "Interview Prepper",
      value: "task_interview_prepper",
    },
    {
      desc: "Improve professional skills",
      icon: "/icons/usecases/career/skill-enhancer.svg",
      title: "Skill Enhancer",
      value: "task_skill_enhancer",
    },
    {
      desc: "Plan career trajectories",
      icon: "/icons/usecases/career/career-planner.svg",
      title: "Career Planner",
      value: "task_career_planner",
    },
    {
      desc: "Optimize LinkedIn profiles",
      icon: "/icons/usecases/career/profile-optimizer.svg",
      title: "Profile Optimizer",
      value: "task_profile_optimizer",
    },
    {
      desc: "Set professional goals",
      icon: "/icons/usecases/career/goal-setter.svg",
      title: "Goal Setter",
      value: "task_goal_setter",
    },
    {
      desc: "Build personal brands",
      icon: "/icons/usecases/career/brand-builder.svg",
      title: "Brand Builder",
      value: "task_brand_builder",
    },
  ],
  education: [
    {
      desc: "Expand your vocabulary through word associations",
      icon: "/icons/usecases/education/word-associations.svg",
      title: "Word Associations",
      value: "task_word_associations",
    },
    {
      desc: "Check and correct your grammar",
      icon: "/icons/usecases/education/grammar-check.svg",
      title: "Grammar Check",
      value: "task_grammar_check",
    },
    {
      desc: "Restate a paragraph in your own words",
      icon: "/icons/usecases/education/paraphrasing.svg",
      title: "Paraphrasing",
      value: "task_paraphrasing",
    },
    {
      desc: "Explore English idiom",
      icon: "/icons/usecases/education/idiom-explorations.svg",
      title: "Idiom Explorations",
      value: "task_idiom_explorations",
    },
    {
      desc: "Learn English proverbs",
      icon: "/icons/usecases/education/daily-proverbs.svg",
      title: "Daily Proverbs",
      value: "task_daily_proverbs",
    },
    {
      desc: "Get help with language translation",
      icon: "/icons/usecases/education/language-translation.svg",
      title: "Language Translation",
      value: "task_language_translation",
    },
    {
      desc: "Get instant math solutions",
      icon: "/icons/usecases/education/math-solutions.svg",
      title: "Math Solutions",
      value: "task_math_solutions",
    },
    {
      desc: "Access comprehensive study guides",
      icon: "/icons/usecases/education/study-guides.svg",
      title: "Study Guides",
      value: "task_study_guides",
    },
    {
      desc: "Get writing suggestions and tips",
      icon: "/icons/usecases/education/writing-assistance.svg",
      title: "Writing Assistance",
      value: "task_writing_assistance",
    },
  ],
  for_work: [
    {
      desc: "Compose professional emails",
      icon: "/icons/usecases/work/email-composer.svg",
      title: "Email Composer",
      value: "task_email_composer",
    },
    {
      desc: "Formulate email replies",
      icon: "/icons/usecases/work/reply-formulator.svg",
      title: "Reply Formulator",
      value: "task_reply_formulator",
    },
  ],
  fun: [
    {
      desc: "Convert text to emoji expressions",
      icon: "/icons/usecases/fun/emoji-translator.svg",
      title: "Emoji Translator",
      value: "task_emoji_translator",
    },
    {
      desc: "Get inspired for your next art project",
      icon: "/icons/usecases/fun/artwork-inspiration.svg",
      title: "Artwork Inspiration",
      value: "task_artwork_inspiration",
    },
    {
      desc: "Generate song lyrics for your music",
      icon: "/icons/usecases/fun/lyric-writer.svg",
      title: "Lyric Writer",
      value: "task_lyric_writer",
    },
    {
      desc: "Find inspiration for songwriting",
      icon: "/icons/usecases/fun/lyric-inspiration.svg",
      title: "Lyric Inspiration",
      value: "task_lyric_inspiration",
    },
  ],
  ideas: [
    {
      desc: "Generate new product ideas",
      icon: "/icons/usecases/ideas/brainstorming.svg",
      title: "Brainstorming",
      value: "task_brainstorming",
    },
    {
      desc: "Prepare media social plan for product launch",
      icon: "/icons/usecases/ideas/online-strategy.svg",
      title: "Online Strategy",
      value: "task_online_strategy",
    },
    {
      desc: "Brainstorm marketing slogans",
      icon: "/icons/usecases/ideas/marketing-slogans.svg",
      title: "Marketing Slogans",
      value: "task_marketing_slogans",
    },
    {
      desc: "Design a brand logo and color palette",
      icon: "/icons/usecases/ideas/brand-identity.svg",
      title: "Brand Identity",
      value: "task_brand_identity",
    },
    {
      desc: "Plan team-building activities for a team",
      icon: "/icons/usecases/ideas/team-building.svg",
      title: "Team Building",
      value: "task_team_building",
    },
    {
      desc: "Discover DIY craft projects",
      icon: "/icons/usecases/ideas/diy-craft-ideas.svg",
      title: "DIY Craft Ideas",
      value: "task_diy_craft_ideas",
    },
  ],
  marketing: [
    {
      desc: "Generate engaging social media post ideas",
      icon: "/icons/usecases/marketing/post-ideas.svg",
      title: "Post Ideas",
      value: "task_post_ideas",
    },
    {
      desc: "Create compelling email",
      icon: "/icons/usecases/marketing/email-generator.svg",
      title: "Email Generator",
      value: "task_email_generator",
    },
    {
      desc: "Find inspiration for ad copy",
      icon: "/icons/usecases/marketing/ad-copy-inspiration.svg",
      title: "Ad Copy Inspiration",
      value: "task_ad_copy_inspiration",
    },
    {
      desc: "Gather market research insights",
      icon: "/icons/usecases/marketing/research-insights.svg",
      title: "Research Insights",
      value: "task_research_insights",
    },
    {
      desc: "Create a memorable brand tagline",
      icon: "/icons/usecases/marketing/brand-tagline.svg",
      title: "Brand Tagline",
      value: "task_brand_tagline",
    },
    {
      desc: "Identify relevant SEO keywords",
      icon: "/icons/usecases/marketing/seo-keywords.svg",
      title: "SEO Keywords",
      value: "task_seo_keywords",
    },
    {
      desc: "Generate product naming ideas",
      icon: "/icons/usecases/marketing/product-naming.svg",
      title: "Product Naming",
      value: "task_product_naming",
    },
  ],
  social_media: [
    {
      desc: "Compose Twitter posts",
      icon: "/icons/usecases/social-media/tweets.svg",
      title: "Tweets",
      value: "task_tweets",
    },
    {
      desc: "Turn article / link into a tweet",
      icon: "/icons/usecases/social-media/share-article-link.svg",
      title: "Share Article / Link",
      value: "task_share_article_link",
    },
    {
      desc: "Retweet with comment",
      icon: "/icons/usecases/social-media/retweet.svg",
      title: "Retweet",
      value: "task_retweet",
    },
    {
      desc: "Compose hashtags for tweet",
      icon: "/icons/usecases/social-media/hashtags.svg",
      title: "Hashtags",
      value: "task_hashtags",
    },
    {
      desc: "Compose Instagram posts",
      icon: "/icons/usecases/social-media/posts.svg",
      title: "Posts",
      value: "task_posts",
    },
    {
      desc: "Compose Instagram captions",
      icon: "/icons/usecases/social-media/captions.svg",
      title: "Captions",
      value: "task_captions",
    },
    {
      desc: "Commenting on an Instagram post",
      icon: "/icons/usecases/social-media/response.svg",
      title: "Response",
      value: "task_response",
    },
    {
      desc: "Compose hashtags for Instagram post",
      icon: "/icons/usecases/social-media/hashtags-insta.svg",
      title: "Hashtags Insta",
      value: "task_hashtags_insta",
    },
    {
      desc: "Engage with thought-provoking questions",
      icon: "/icons/usecases/social-media/engaging-questions.svg",
      title: "Engaging Questions",
      value: "task_engaging_questions",
    },
    {
      desc: "Compose inspiring and motivational quotes",
      icon: "/icons/usecases/social-media/inspirational-quotes.svg",
      title: "Inspirational Quotes",
      value: "task_inspirational_quotes",
    },
    {
      desc: "Design hilarious response to a topic",
      icon: "/icons/usecases/social-media/fun-response.svg",
      title: "Fun Response",
      value: "task_fun_response",
    },
  ],
  writing: [
    {
      desc: "Coach academic writing",
      icon: "/icons/usecases/writing/writing-coach.svg",
      title: "Writing Coach",
      value: "task_writing_coach",
    },
    {
      desc: "Summarize relevant academic literature",
      icon: "/icons/usecases/writing/literature-summarizer.svg",
      title: "Literature Summarizer",
      value: "task_literature_summarizer",
    },
    {
      desc: "Formulate research hypotheses",
      icon: "/icons/usecases/writing/hypothesis-formulator.svg",
      title: "Hypothesis Formulator",
      value: "task_hypothesis_formulator",
    },
    {
      desc: "Develop research methodologies",
      icon: "/icons/usecases/writing/methodology-planner.svg",
      title: "Methodology Planner",
      value: "task_methodology_planner",
    },
    {
      desc: "Interpret research data",
      icon: "/icons/usecases/writing/data-interpreter.svg",
      title: "Data Interpreter",
      value: "task_data_interpreter",
    },
    {
      desc: "Craft research proposals",
      icon: "/icons/usecases/writing/proposal-writer.svg",
      title: "Proposal Writer",
      value: "task_proposal_writer",
    },
    {
      desc: "Formulate thesis statements",
      icon: "/icons/usecases/writing/thesis-creator.svg",
      title: "Thesis Creator",
      value: "task_thesis_creator",
    },
    {
      desc: "Create academic presentations",
      icon: "/icons/usecases/writing/presentation-maker.svg",
      title: "Presentation Maker",
      value: "task_presentation_maker",
    },
    {
      desc: "Structure logical arguments",
      icon: "/icons/usecases/writing/argument-structurer.svg",
      title: "Argument Structurer",
      value: "task_argument_structurer",
    },
    {
      desc: "Summarize research findings",
      icon: "/icons/usecases/writing/research-summarizer.svg",
      title: "Research Summarizer",
      value: "task_research_summarizer",
    },
    {
      desc: "Verify citation accuracy",
      icon: "/icons/usecases/writing/citation-checker.svg",
      title: "Citation Checker",
      value: "task_citation_checker",
    },
    {
      desc: "Integrate review feedback",
      icon: "/icons/usecases/writing/feedback-integrator.svg",
      title: "Feedback Integrator",
      value: "task_feedback_integrator",
    },
    {
      desc: "Explore theoretical frameworks",
      icon: "/icons/usecases/writing/theory-explorer.svg",
      title: "Theory Explorer",
      value: "task_theory_explorer",
    },
    {
      desc: "Generate creative writing ideas or prompts",
      icon: "/icons/usecases/writing/idea-generator.svg",
      title: "Idea Generator",
      value: "task_idea_generator",
    },
    {
      desc: "Clarify complex concepts",
      icon: "/icons/usecases/writing/concept-clarifier.svg",
      title: "Concept Clarifier",
      value: "task_concept_clarifier",
    },
    {
      desc: "Reframe or restructure sentences for clarity and impact",
      icon: "/icons/usecases/writing/sentence-reframer.svg",
      title: "Sentence Reframer",
      value: "task_sentence_reframer",
    },
    {
      desc: "Enhance dialogues to be more engaging and realistic",
      icon: "/icons/usecases/writing/dialogue-improver.svg",
      title: "Dialogue Improver",
      value: "task_dialogue_improver",
    },
    {
      desc: "Develop detailed profiles for fictional characters",
      icon: "/icons/usecases/writing/character-development.svg",
      title: "Character Development",
      value: "task_character_development",
    },
    {
      desc: "Generate plot twists for stories or narratives",
      icon: "/icons/usecases/writing/plot-twister.svg",
      title: "Plot Twister",
      value: "task_plot_twister",
    },
  ],
};

export const INTEREST_PROMPT_OPTIONS = {
  // career_development
  task_resume_builder: {
    promptTemplate:
      'Build a professional resume tailored to the career focus: "input1"',
    question: ["What is your career focus?"],
  },
  task_cover_letter: {
    promptTemplate: 'Write a compelling cover letter for the job: "input1"',
    question: ["Which job are you applying for?"],
  },
  task_interview_prepper: {
    promptTemplate: 'Provide interview preparation tips for the job: "input1"',
    question: ["What job are you interviewing for?"],
  },
  task_skill_enhancer: {
    promptTemplate: 'Suggest ways to enhance the professional skill: "input1"',
    question: ["Which skill do you want to enhance?"],
  },
  task_career_planner: {
    promptTemplate: 'Outline a career development plan for the goal: "input1"',
    question: ["What is your career goal?"],
  },
  task_profile_optimizer: {
    promptTemplate:
      'Optimize a LinkedIn profile for the professional focus: "input1"',
    question: ["What is your professional focus?"],
  },
  task_goal_setter: {
    promptTemplate:
      'Help set achievable and strategic career goals related to: "input1"',
    question: ["What are your career aspirations?"],
  },
  task_brand_builder: {
    promptTemplate:
      'Develop strategies to build a personal brand around: "input1"',
    question: ["What is your branding focus?"],
  },

  // for_work
  task_email_composer: {
    promptTemplate: 'Compose a professional email for the purpose: "input1"',
    question: ["What is the purpose of the email?"],
  },
  task_reply_formulator: {
    promptTemplate:
      'Formulate a professional and appropriate reply to the given email context: "input1"',
    question: ["What is the context of the email you are replying to?"],
  },

  // marketing
  task_post_ideas: {
    promptTemplate:
      'Provide creative post ideas to boost my marketing efforts for this product / service: "input1" to post on: input2',
    question: [
      "Which social media platform would you like to create a post for?",
      "Which product / service do want to post about?",
    ],
  },
  task_email_generator: {
    promptTemplate:
      'Generate an email for the topic or purpose: "input1" to send to: input2',
    question: [
      "Who will be the receiver?",
      "What's the topic or purpose of your email?",
    ],
  },
  task_ad_copy_inspiration: {
    promptTemplate:
      'Provide compelling copy ideas for this ad\'s objective and audience: "input1"',
    question: ["What's the ad's focus and target audience?"],
  },
  task_research_insights: {
    promptTemplate:
      'Provide data and insights to guide my strategy for this target market: "input1"',
    question: ["Which market or industry are you interested in researching?"],
  },
  task_brand_tagline: {
    promptTemplate: 'Generate catchy tagline ideas for this: "input1"',
    question: ["What's the essence or unique selling point of your brand?"],
  },
  task_seo_keywords: {
    promptTemplate:
      'Suggest effective SEO keywords to improve visibility for this content / website: "input1"',
    question: ["What's the focus of your content or website?"],
  },
  task_product_naming: {
    promptTemplate:
      'Suggest memorable and relevant names for this product / service: "input1"',
    question: ["What type of product or service do you need a name for?"],
  },

  // education
  task_word_associations: {
    promptTemplate:
      'Receive list five related words or synonyms of the word: "input1", and its example',
    question: ["What word do you want to find?"],
  },
  task_grammar_check: {
    promptTemplate:
      'Do English grammar check for the following sentence: "input1"',
    question: ["What sentence do you want to do grammar check?"],
  },
  task_paraphrasing: {
    promptTemplate:
      'Paraphrase the following sentence using input2 tone: "input1"',
    question: [
      "What paragraph do you want to rephrase?",
      "Which tone would you like to apply: formal, casual, academic, creative, or professional...?",
    ],
  },
  task_idiom_explorations: {
    promptTemplate:
      "Discover the meaning of a common idiom and use it in a sentence",
    question: [
      "Ready to decode an English idiom? Paste it here and I’ll break it down for you!",
    ],
  },
  task_daily_proverbs: {
    promptTemplate:
      "Interpret the meaning of a traditional English proverb and apply it to a modern scenario",
    question: [
      "Curious about a traditional English proverb and its relevance today? Share the proverb, and I’ll explain its meaning",
    ],
  },
  task_language_translation: {
    promptTemplate:
      'Translate the following sentence: "input1" to language: input2',
    question: [
      "What sentence do you want to translate?",
      "What language do want to translate to?",
    ],
  },
  task_math_solutions: {
    promptTemplate:
      'Receive step-by-step solutions and explanations for this math problem: "input1"',
    question: ["What math problem do you need help with?"],
  },
  task_study_guides: {
    promptTemplate:
      'Provide study guides and summaries to aid my learning for this topic: "input1"',
    question: ["Which topic are you studying?"],
  },
  task_writing_assistance: {
    promptTemplate:
      'Help my writing for this topic: "input1", with writing help: input2',
    question: [
      "Which topic are you writing about?",
      "What type of writing help do you need (grammar, structure, or general writing tips)?",
    ],
  },

  // writing
  task_writing_coach: {
    promptTemplate:
      'Provide coaching and advice on improving academic writing in area: "input1"',
    question: ["What aspect of writing do you need help with?"],
  },
  task_literature_summarizer: {
    promptTemplate:
      'Create a comprehensive literature review outline for the topic: "input1"',
    question: ["What is your research topic?"],
  },
  task_hypothesis_formulator: {
    promptTemplate:
      'Formulate a testable hypothesis based on the research area: "input1"',
    question: ["What is your research area or question?"],
  },
  task_methodology_planner: {
    promptTemplate:
      'Outline a suitable methodology for the research type: "input1"',
    question: ["What is the nature of your research?"],
  },
  task_data_interpreter: {
    promptTemplate:
      'Provide guidance on interpreting and presenting analysis of "input1" data',
    question: ["What type of data do you need to analyze?"],
  },
  task_proposal_writer: {
    promptTemplate:
      'Draft a structured research proposal for the idea: "input1"',
    question: ["What is your research idea or question?"],
  },
  task_thesis_creator: {
    promptTemplate:
      'Develop a clear and concise thesis statement based on: "input1"',
    question: ["What is the main argument or focus of your paper?"],
  },
  task_presentation_maker: {
    promptTemplate:
      'Outline a compelling academic presentation on the topic: "input1"',
    question: ["What is the topic of your presentation?"],
  },
  task_argument_structurer: {
    promptTemplate: 'Structure a logical and coherent argument for: "input1"',
    question: ["What is your main argument?"],
  },
  task_research_summarizer: {
    promptTemplate: 'Summarize the key findings of your research on: "input1"',
    question: ["What are your key research findings?"],
  },
  task_citation_checker: {
    promptTemplate:
      'Check and verify the accuracy of citations in the text on topic: "input1"',
    question: ["Which citations need checking?"],
  },
  task_feedback_integrator: {
    promptTemplate:
      'Integrate the provided feedback into your paper on topic: "input1"',
    question: ["What feedback do you need to integrate?"],
  },
  task_theory_explorer: {
    promptTemplate:
      'Provide an exploration and analysis of the theory: "input1"',
    question: ["Which theory are you exploring?"],
  },
  task_idea_generator: {
    promptTemplate:
      'Provide a creative writing prompt or idea based on the genre or theme: "input1"',
    question: ["What genre or theme are you interested in?"],
  },
  task_concept_clarifier: {
    promptTemplate:
      'Clarify and explain the concept of "input1" in a simple manner',
    question: ["Which concept needs clarification?"],
  },
  task_sentence_reframer: {
    promptTemplate:
      'Reframe the provided sentence to enhance clarity and impact: "input1"',
    question: ["Which sentence would you like to reframe?"],
  },
  task_dialogue_improver: {
    promptTemplate:
      'Improve the provided dialogue to make it more engaging and realistic: "input"',
    question: ["What dialogue do you need help with?"],
  },
  task_character_development: {
    promptTemplate:
      'Expand the provided character outline-solid into a detailed profile: "input"',
    question: ["What is the basic outline-solid of your character?"],
  },
  task_plot_twister: {
    promptTemplate:
      'Suggest an intriguing plot twist for the given story plot: "input"',
    question: ["What is the current plot of your story?"],
  },

  // social_media
  task_tweets: {
    promptTemplate:
      'Compose a tweet (including trend hashtags) about: "input1"',
    question: ["What topic do you want to tweet?"],
  },
  task_share_article_link: {
    promptTemplate:
      'Compose a tweet about this article / link: "input1", base on my opinion: input2',
    question: [
      "What article / link do you want to tweet?",
      "What's your thought about it?",
    ],
  },
  task_retweet: {
    promptTemplate:
      'I want to retweet a tweet and add 5 possible comments from my opinion. The tweet is: "input1". My opinion is: input2',
    question: [
      "What tweet do you want to retweet?",
      "What's your thought about that tweet?",
    ],
  },
  task_hashtags: {
    promptTemplate: 'Compose 5 hashtag ideas for this tweet: "input1"',
    question: ["What tweet do you want to generate hashtags?"],
  },
  task_posts: {
    promptTemplate:
      'Compose an Instagram post (including trend hashtags) about: "input1"',
    question: ["What topic do you want to post?"],
  },
  task_captions: {
    promptTemplate:
      'Compose an Instagram caption for the photo with description: "input1"',
    question: ["Describe the photo in your post in as much detail as posible."],
  },
  task_response: {
    promptTemplate:
      'I want to respond to an Instagram post and add 5 possible comments from my opinion. The post is: "input1". My opinion is: input2',
    question: [
      "What post do you want to response?",
      "What's your thought about that post?",
    ],
  },
  task_hashtags_insta: {
    promptTemplate: 'Compose 5 hashtag ideas for this Instagram post: "input1"',
    question: ["What post do you want to generate hashtags?"],
  },
  task_engaging_questions: {
    promptTemplate:
      'Compose a post asking a thought-provoking question about: "input1"',
    question: ["What topic do want to ask about?"],
  },
  task_inspirational_quotes: {
    promptTemplate:
      'Compose some inspiring quotes that uplifts and motivates my followers about: "input1"',
    question: ["What topic do you want to quote about?"],
  },
  task_fun_response: {
    promptTemplate:
      'Compose 5 responses (including fun and related emoji) in different kind of funny and hilarious for this topic: "input1"',
    question: ["What topic do you want to respond to?"],
  },

  // ideas
  task_brainstorming: {
    promptTemplate:
      'Let your creativity flow and come up with five unique and innovative product concepts for: "input1"',
    question: ["What's your product?"],
  },
  task_online_strategy: {
    promptTemplate:
      'Provide a step-by-step outline-solid for a week-long social media campaign to create buzz around the product/service: "input1"',
    question: ["What's your product/service?"],
  },
  task_marketing_slogans: {
    promptTemplate:
      'Come up with five catchy slogans that emphasize the unique selling points of your product/consulting service: "input1"',
    question: ["What's your product/service?"],
  },
  task_brand_identity: {
    promptTemplate:
      'Design a modern and memorable logo along with a cohesive color palette for: "input1"',
    question: ["What's your product/company business?"],
  },
  task_team_building: {
    promptTemplate:
      'Organize virtual team-building exercises to strengthen collaboration and boost team morale. The company business is about: "input1"',
    question: ["What's your company business?"],
  },
  task_diy_craft_ideas: {
    promptTemplate:
      "Teach me how to make a random DIY craft project using simple materials",
    question: null,
  },

  // fun
  task_emoji_translator: {
    promptTemplate:
      'Create an emoji-based translation for the following sentence: "input1"',
    question: ["What text do you want to make emoji?"],
  },
  task_artwork_inspiration: {
    promptTemplate:
      "Receive a random art theme or concept to inspire your next painting, drawing, or digital artwork",
    question: null,
  },
  task_lyric_writer: {
    promptTemplate:
      'Compose an inspiring and emotive song lyrics based for a song about: "input1"',
    question: ["What's your song about?"],
  },
  task_lyric_inspiration: {
    promptTemplate:
      "Generate a set of song lyric ideas based on different emotions or themes",
    question: null,
  },
} as const;

export const RESET_USAGE_TOAST_OPTIONS = {
  "24h": {
    descKey: "toast.resetUsage.desc24h",
    titleKey: "toast.resetUsage.title24h",
  },
  "48h": {
    descKey: "toast.resetUsage.desc48h",
    titleKey: "toast.resetUsage.title48h",
  },
  default: {
    descKey: "toast.resetUsage.desc",
    titleKey: "toast.resetUsage.title",
  },
};
