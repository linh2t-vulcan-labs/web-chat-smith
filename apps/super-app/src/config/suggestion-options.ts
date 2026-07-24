import type { TSuggestionItem } from "@/hooks/use-conversation-suggestions";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";
import { WELCOME_SUGGESTIONS_IMAGE } from "@/utils/constants/cdn";

export const imageToImageSuggestions: TSuggestionItem[] = [
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.imageToImage.highFashionPortrait",
    prompt:
      "Using my photo as reference, create a high-fashion studio portrait with clean white background, same face and hairstyle, elegant DIOR-style editorial lighting.",
    title: "Turn my photo into a high-fashion magazine portrait",
    url: WELCOME_SUGGESTIONS_IMAGE.DRAW_SNOWY_MOUNTAINS,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.imageToImage.warmStreetArt",
    prompt:
      "Transform my photo into a 35mm cinematic outdoor portrait in golden sunlight, soft dreamy tone, nostalgic Y2K vibe, with natural film grain and warm glow.",
    title: "Restyle my image as a warm street art photo",
    url: WELCOME_SUGGESTIONS_IMAGE.WARM_STREET_ART_PHOTO,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.imageToImage.dreamyFloralGaze",
    prompt:
      "Turn my portrait into a dreamy floral scene under golden hour light, sunlight filtered through wildflowers, soft shadows and delicate cinematic texture.",
    title: "Give my portrait a dreamy, floral gaze look",
    url: WELCOME_SUGGESTIONS_IMAGE.DREAMY_FLORAL_GAZE,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.imageToImage.windKissedPortrait",
    prompt:
      "Transform my image into a minimalist portrait against blue sky and soft clouds, hair flowing naturally in the wind, clean aesthetic, calm expression.",
    title: "Turn my photo into a wind-kissed outdoor portrait",
    url: WELCOME_SUGGESTIONS_IMAGE.WIND_KISSED_OUTDOOR_PORTRAIT,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.imageToImage.goldenHourCloseup",
    prompt:
      "Create warm close-up portrait from my photo, lying down, glowing golden light, shallow depth, cinematic softness.",
    title: "Restyle my image as a golden hour close-up",
    url: WELCOME_SUGGESTIONS_IMAGE.GOLDEN_HOUR_CLOSEUP,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.imageToImage.lightShadowComposition",
    prompt:
      "Refine my image into a soft light-and-shadow portrait framed by white blossoms, gentle blue tint, serene upward gaze, and a tranquil film-like atmosphere.",
    title: "Give my portrait a light and shadow composition",
    url: WELCOME_SUGGESTIONS_IMAGE.LIGHT_SHADOW_PORTRAIT,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.imageToImage.vintageNightTone",
    prompt:
      "Transform my portrait with vintage night lighting, low contrast glow, soft ambient color shifts, 3-4 tone variations with cinematic depth.",
    title: "Turn my photo into a vintage night tone",
    url: WELCOME_SUGGESTIONS_IMAGE.VINTAGE_NIGHT_TONE,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.imageToImage.aquariumFilmPortrait",
    prompt:
      "Turn my image into a cinematic aquarium setting, warm reflections across skin, fish lights in foreground, dreamy underwater feel, soft film grain tone.",
    title: "Restyle my image as an aquarium film portrait",
    url: WELCOME_SUGGESTIONS_IMAGE.AQUARIUM_FILM_PORTRAIT,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.imageToImage.candidSunset",
    prompt:
      "Transform my photo into a dusk beach flash portrait - subject glowing against purple-red horizon, candid turn toward camera, dreamy motion moment.",
    title: "Give my portrait a candid sunset aesthetic",
    url: WELCOME_SUGGESTIONS_IMAGE.CANDID_SUNSET_AESTHETIC,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.imageToImage.chicElevatorEditorial",
    prompt:
      "Edit my image into a modern elevator scene, all-black outfit, reflective metal walls, neon ceiling lights, holding a coffee cup, elegant and mysterious mood.",
    title: "Turn my photo into a chic elevator editorial shot",
    url: WELCOME_SUGGESTIONS_IMAGE.CHIC_ELEVATOR_EDITORIAL,
  },
];

export const textToImageSuggestions: TSuggestionItem[] = [
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.textToImage.snowyMountainLandscape",
    prompt:
      "Illustrate a snowy mountain range with a clear blue sky background.",
    title: "Draw a snowy mountain landscape",
    url: WELCOME_SUGGESTIONS_IMAGE.DRAW_SNOWY_MOUNTAINS_TEXT_TO_IMAGE,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.textToImage.cuteCartoonGirl",
    prompt: "Generate a cute cartoon character with pink hair and big eyes.",
    title: "Create a cute cartoon girl character",
    url: WELCOME_SUGGESTIONS_IMAGE.CUTE_CARTOON_CHARACTER,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.textToImage.fantasyCastleDragon",
    prompt: "Create a fantasy scene with a castle and a dragon flying above.",
    title: "Paint a fantasy castle and dragon scene",
    url: WELCOME_SUGGESTIONS_IMAGE.PAINT_FANTASY_CASTLE,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.textToImage.galaxySpaceArt",
    prompt: "Illustrate a galaxy scene with stars, planets, and a spaceship.",
    title: "Illustrate a colorful galaxy space art",
    url: WELCOME_SUGGESTIONS_IMAGE.SHOW_GALAXY_SPACE_ART,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.textToImage.retroNeonPoster",
    prompt: "Make a retro 1980s style poster with neon typography.",
    title: "Design a retro 1980s neon poster",
    url: WELCOME_SUGGESTIONS_IMAGE.RETRO_1980S_STYLE_NEON_TYPOGRAPHY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.textToImage.futuristicCity",
    prompt:
      "Generate concept art of a futuristic city skyline with tall towers.",
    title: "Create a futuristic city skyline",
    url: WELCOME_SUGGESTIONS_IMAGE.CREATE_FUTURISTIC_CITY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.textToImage.minimalLeafLogo",
    prompt: "Create a simple logo design shaped like a leaf.",
    title: "Design a minimal leaf logo design",
    url: WELCOME_SUGGESTIONS_IMAGE.DESIGN_MINIMAL_LOGO,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.textToImage.indieAlbumCover",
    prompt: "Design a moody indie music album cover with dark tones.",
    title: "Make a dark indie album cover",
    url: WELCOME_SUGGESTIONS_IMAGE.DARK_INDIE_ALBUM_COVER,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.textToImage.aiMeme",
    prompt: "Create a meme image with witty global humor.",
    title: "Design AI-generated meme",
    url: WELCOME_SUGGESTIONS_IMAGE.DESIGN_AI_GENERATED_MEME,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.textToImage.futuristicSneaker",
    prompt: "Design futuristic sneaker concept art.",
    title: "Make futuristic sneaker concept",
    url: WELCOME_SUGGESTIONS_IMAGE.FUTURISTIC_SNEAKER_CONCEPT,
  },
];

export const infoQuerySuggestions: TSuggestionItem[] = [
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.infoQuery.explainAI",
    prompt:
      "Explain in simple terms what artificial intelligence is and how it works.",
    title: "Explain AI simply",
    url: WELCOME_SUGGESTIONS_IMAGE.INFO_QUERY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.infoQuery.apollo11Summary",
    prompt:
      "Summarize the Apollo 11 mission and explain why it was significant.",
    title: "Summarize Apollo 11 mission",
    url: WELCOME_SUGGESTIONS_IMAGE.INFO_QUERY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.infoQuery.dailyWalkingBenefits",
    prompt: "Provide a list of key health benefits from walking every day.",
    title: "Provide benefits of daily walking",
    url: WELCOME_SUGGESTIONS_IMAGE.INFO_QUERY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.infoQuery.blockchainSimple",
    prompt: "Give me a short and clear definition of blockchain technology.",
    title: "Explain blockchain in simple words",
    url: WELCOME_SUGGESTIONS_IMAGE.INFO_QUERY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.infoQuery.greenhouseEffect",
    prompt:
      "Explain how the greenhouse effect works and its impact on global climate.",
    title: "Explain greenhouse effect",
    url: WELCOME_SUGGESTIONS_IMAGE.INFO_QUERY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.infoQuery.improveFocus",
    prompt: "Give me practical techniques to improve focus at work.",
    title: "How to focus better",
    url: WELCOME_SUGGESTIONS_IMAGE.INFO_QUERY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.infoQuery.manageStress",
    prompt: "Provide simple ways to reduce daily stress.",
    title: "Tips to manage stress",
    url: WELCOME_SUGGESTIONS_IMAGE.INFO_QUERY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.infoQuery.morningRoutine",
    prompt: "Suggest steps to build a healthy and productive morning routine.",
    title: "Build a morning routine",
    url: WELCOME_SUGGESTIONS_IMAGE.INFO_QUERY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.infoQuery.sleepQuality",
    prompt: "Share methods to sleep better and wake up refreshed.",
    title: "Ways to improve sleep quality",
    url: WELCOME_SUGGESTIONS_IMAGE.INFO_QUERY,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.infoQuery.stayMotivated",
    prompt: "Explain how to keep motivation high over time.",
    title: "How to stay motivated?",
    url: WELCOME_SUGGESTIONS_IMAGE.INFO_QUERY,
  },
];

export const funSocialSuggestions: TSuggestionItem[] = [
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.funSocial.riddle",
    prompt: "Give me a fun short riddle and wait for my answer.",
    title: "Ask me a riddle",
    url: WELCOME_SUGGESTIONS_IMAGE.FUN_SOCIAL,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.funSocial.joke",
    prompt: "Share a quick joke that is light and funny.",
    title: "Tell me a joke",
    url: WELCOME_SUGGESTIONS_IMAGE.FUN_SOCIAL,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.funSocial.catCaption",
    prompt: "Write a cute Instagram caption for a cat photo.",
    title: "Suggest photo caption for a cat",
    url: WELCOME_SUGGESTIONS_IMAGE.FUN_SOCIAL,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.funSocial.coffeePoem",
    prompt: "Write a playful 4-line poem about coffee in daily life.",
    title: "Make a coffee poem",
    url: WELCOME_SUGGESTIONS_IMAGE.FUN_SOCIAL,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.funSocial.pickupLine",
    prompt: "Provide a clever and funny pickup line for texting.",
    title: "Give pickup line",
    url: WELCOME_SUGGESTIONS_IMAGE.FUN_SOCIAL,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.funSocial.hangoutInvite",
    prompt: "Give me fun ways to ask someone to hang out.",
    title: "Ask to hang out",
    url: WELCOME_SUGGESTIONS_IMAGE.FUN_SOCIAL,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.funSocial.quizQuestion",
    prompt: "Create a quick multiple-choice trivia question with 3 options.",
    title: "Ask quiz question",
    url: WELCOME_SUGGESTIONS_IMAGE.FUN_SOCIAL,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.funSocial.inspiringQuote",
    prompt: "Tell me a motivational and inspiring quote.",
    title: "Share an inspiring quote",
    url: WELCOME_SUGGESTIONS_IMAGE.FUN_SOCIAL,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.funSocial.animalFact",
    prompt: "Give me a surprising fun fact about animals.",
    title: "Tell me a surprising animal fact",
    url: WELCOME_SUGGESTIONS_IMAGE.FUN_SOCIAL,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.funSocial.wordChainGame",
    prompt: "Start a simple word game with me, like word chain.",
    title: "Start a word chain game",
    url: WELCOME_SUGGESTIONS_IMAGE.FUN_SOCIAL,
  },
];

export const deepResearchSuggestions: TSuggestionItem[] = [
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.deepResearch.remoteWorkImpact",
    prompt:
      "Provide research on productivity and mental health in remote work.",
    title: "Research remote work impact",
    url: WELCOME_SUGGESTIONS_IMAGE.DEEP_RESEARCH,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.deepResearch.coffeeIndustry",
    prompt: "Give me a market analysis of the global coffee industry.",
    title: "Analyze the global coffee industry",
    url: WELCOME_SUGGESTIONS_IMAGE.DEEP_RESEARCH,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.deepResearch.kpopInfluence",
    prompt: "Summarize studies on the worldwide cultural impact of K-pop.",
    title: "Research K-pop's global influence",
    url: WELCOME_SUGGESTIONS_IMAGE.DEEP_RESEARCH,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.deepResearch.educationModels",
    prompt: "Compare pros and cons of Finland vs US education systems.",
    title: "Compare Finland and US education models",
    url: WELCOME_SUGGESTIONS_IMAGE.DEEP_RESEARCH,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.deepResearch.habitFormation",
    prompt: "Provide research on how the brain forms and breaks habits.",
    title: "Study how habits form and change",
    url: WELCOME_SUGGESTIONS_IMAGE.DEEP_RESEARCH,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.deepResearch.renewableEnergy",
    prompt: "Analyze global adoption trends of renewable energy.",
    title: "Analyze renewable energy adoption trends",
    url: WELCOME_SUGGESTIONS_IMAGE.DEEP_RESEARCH,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.deepResearch.socialMediaTeens",
    prompt:
      "Summarize studies on social media's psychological effects on teenagers.",
    title: "Research social media effects on teens",
    url: WELCOME_SUGGESTIONS_IMAGE.DEEP_RESEARCH,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.deepResearch.startupFailures",
    prompt: "Find patterns in case studies of why startups fail.",
    title: "Find key reasons startups fail",
    url: WELCOME_SUGGESTIONS_IMAGE.DEEP_RESEARCH,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.deepResearch.mindfulnessWork",
    prompt: "Provide academic findings on mindfulness practices in workplaces.",
    title: "Research mindfulness at workplaces",
    url: WELCOME_SUGGESTIONS_IMAGE.DEEP_RESEARCH,
  },
  {
    id: generateRandomUUIDV4(),
    key: "chatSuggestion.deepResearch.spaceExploration",
    prompt:
      "Summarize milestones in human space exploration and lessons learned.",
    title: "Summarize milestones in space exploration",
    url: WELCOME_SUGGESTIONS_IMAGE.DEEP_RESEARCH,
  },
];

export const configSuggestions = {
  deepResearch: {
    actionType: "deep_research" as const,
    isEnabled: true,
    type: "icon" as const,
  },
  funSocial: {
    actionType: "fun_social" as const,
    isEnabled: true,
    type: "icon" as const,
  },
  imageToImage: {
    actionType: "image_to_image" as const,
    isEnabled: true,
    type: "image" as const,
  },
  infoQuery: {
    actionType: "info_query" as const,
    isEnabled: true,
    type: "icon" as const,
  },
  textToImage: {
    actionType: "text_to_image" as const,
    isEnabled: true,
    type: "image" as const,
  },
};

export const DEFAULT_WELCOME_CONVERSATION_SUGGESTIONS = {
  config: configSuggestions,
  deepResearch: deepResearchSuggestions,
  funSocial: funSocialSuggestions,
  imageToImage: imageToImageSuggestions,
  infoQuery: infoQuerySuggestions,
  textToImage: textToImageSuggestions,
};
