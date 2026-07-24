import { getRuntimeEnv } from "@cs/env/universal";

// Each named export below is a lazy getter (via Object.defineProperty), not a
// plain string — CS_PUBLIC_CDN_PREFIX isn't available until window.__CS_ENV__
// (client) or process.env (server) is read, and reading it at module scope
// would run during the build/prerender pass, before either exists. Property
// access (`AI_ART_STYLES_IMAGE.CARTOON`) still works unchanged at every call
// site; only genuinely eager consumers (module-scope arrays built from these)
// must themselves avoid running during static prerendering — see the
// consuming config files' own comments.
const getCdnPrefix = () => getRuntimeEnv().CS_PUBLIC_CDN_PREFIX;
const getAiArtPrefix = () => `${getCdnPrefix()}/ai_art`;
const getBananaProPrefix = () => `${getCdnPrefix()}/banana_pro`;
const getWelcomeSuggestionsPrefix = () =>
  `${getCdnPrefix()}/welcome_suggestions`;

// Typed by inferring literal keys from the getters object passed in — not a
// generic index signature — so property access (e.g. `.CARTOON`) resolves to
// `string`, not `string | undefined` (this repo's tsconfig sets
// noUncheckedIndexedAccess, which would otherwise widen index-signature reads).
const defineLazy = <T extends Record<string, () => string>>(
  getters: T
): { [K in keyof T]: string } => {
  const target = {} as { [K in keyof T]: string };
  for (const key of Object.keys(getters) as (keyof T)[]) {
    Object.defineProperty(target, key, {
      enumerable: true,
      get: getters[key],
    });
  }
  return target;
};

export const NEW_FEATURE_AI_ART_VIDEO = () =>
  `${getAiArtPrefix()}/text2image_1.mp4`;
export const HERO_BANNER_DESKTOP_URL = () =>
  `${getCdnPrefix()}/ldpv1/hero_banner_v2_desktop.mp4`;
export const UNLOCK_PRO_VIDEO = () =>
  `${getCdnPrefix()}/what-news/unlock_pro.mp4`;

// AI Art Image URLs
export const AI_ART_STYLES_IMAGE = defineLazy({
  NONE: () => `${getAiArtPrefix()}/none.jpg`,

  // Chat Smith
  CARTOON: () => `${getAiArtPrefix()}/cartoon.jpg`,
  _3D: () => `${getAiArtPrefix()}/3D.jpg`,
  REALISTIC: () => `${getAiArtPrefix()}/realistic.jpg`,
  ANIME: () => `${getAiArtPrefix()}/anime.jpg`,
  POP_ART: () => `${getAiArtPrefix()}/pop_art.jpg`,
  CYBERPUNK: () => `${getAiArtPrefix()}/cyberpunk.jpg`,
  NOIR: () => `${getAiArtPrefix()}/noir.jpg`,
  WATERCOLOR: () => `${getAiArtPrefix()}/watercolor.png`,
  LOW_POLY: () => `${getAiArtPrefix()}/low_poly.jpg`,
  DIGITAL_ART: () => `${getAiArtPrefix()}/digital_art.jpg`,
  PAINTING: () => `${getAiArtPrefix()}/oil_painting.jpg`,
  ABSTRACT: () => `${getAiArtPrefix()}/abstract.jpg`,
  SKETCH: () => `${getAiArtPrefix()}/sketch.jpg`,
  CHIBI: () => `${getAiArtPrefix()}/chibi.jpg`,
  FANTASY: () => `${getAiArtPrefix()}/fantasy.jpg`,
  SOUTH_PARK: () => `${getAiArtPrefix()}/southpark.jpg`,
  RICK_AND_MORTY: () => `${getAiArtPrefix()}/rick&morty.jpg`,

  // GPT
  THE_SIMPSONS: () => `${getAiArtPrefix()}/thesimpson.jpg`,
  SAILOR_MOON: () => `${getAiArtPrefix()}/sailormoon.jpg`,
  DORAEMON: () => `${getAiArtPrefix()}/doraemon.jpg`,
  DEMON_SLAYER: () => `${getAiArtPrefix()}/demonslayer.jpg`,
  NARUTO: () => `${getAiArtPrefix()}/naruto.jpg`,
  ATTACK_ON_TITAN: () => `${getAiArtPrefix()}/attackontitan.jpg`,
  ONE_PIECE: () => `${getAiArtPrefix()}/onepiece.jpg`,
  DRAGON_BALL: () => `${getAiArtPrefix()}/dragonball.jpg`,
  GHIBLI: () => `${getAiArtPrefix()}/ghibli.jpg`,
  BLEACH: () => `${getAiArtPrefix()}/bleach.jpg`,

  // Nano Banana
  ART_GALLEY: () => `${getAiArtPrefix()}/art_gallery.jpg`,
  AUTUMN: () => `${getAiArtPrefix()}/autumn.jpg`,
  BIRTHDAY: () => `${getAiArtPrefix()}/birthday.jpg`,
  DOUBLE_POTRAIT: () => `${getAiArtPrefix()}/double_potrait.jpg`,
  MEOWCHIC: () => `${getAiArtPrefix()}/meowchic.jpg`,
  MOUNT_FUJI: () => `${getAiArtPrefix()}/mount_fuji.jpg`,
  PARIS: () => `${getAiArtPrefix()}/paris.jpg`,
  POSTER_DESIGN: () => `${getAiArtPrefix()}/poster_design.jpg`,
  REALISTIC_FIGURE: () => `${getAiArtPrefix()}/realistic_figurine.jpg`,
  ROME: () => `${getAiArtPrefix()}/rome.jpg`,
  SANTORINI: () => `${getAiArtPrefix()}/santorini.jpg`,
  SPOTIFY: () => `${getAiArtPrefix()}/spotify.jpg`,
  STUDIO_PORTRAIT: () => `${getAiArtPrefix()}/studio_portrait.jpg`,
  TAJ_MAHAL: () => `${getAiArtPrefix()}/taj_mahal.jpg`,
  VENICE: () => `${getAiArtPrefix()}/venice.jpg`,
  WINTER: () => `${getAiArtPrefix()}/winter.jpg`,

  // Nano Banana Pro
  GASHAPON_CAPSULE: () => `${getBananaProPrefix()}/gashapon_capsule_before.jpg`,
  GASHAPON_CAPSULE_GIF: () => `${getBananaProPrefix()}/gashapon_capsule.gif`,
  ANATOMICAL_INFOTAGRAPH: () =>
    `${getBananaProPrefix()}/anatomical_infographic_before.jpg`,
  ANATOMICAL_INFOTAGRAPH_GIF: () =>
    `${getBananaProPrefix()}/anatomical_infographic.gif`,
  PRODUCT_TECHNICAL_VIEW: () =>
    `${getBananaProPrefix()}/product_technical_view_before.jpg`,
  PRODUCT_TECHNICAL_VIEW_GIF: () =>
    `${getBananaProPrefix()}/product_technical_view.gif`,
  POSTER_CREATION: () => `${getBananaProPrefix()}/poster_creation_before.jpg`,
  POSTER_CREATION_GIF: () => `${getBananaProPrefix()}/poster_creation.gif`,
  INGREDIENTS: () => `${getBananaProPrefix()}/ingredients_before.jpg`,
  INGREDIENTS_GIF: () => `${getBananaProPrefix()}/ingredients.gif`,
  STUDIO_STYLE_PHOTO: () =>
    `${getBananaProPrefix()}/studio_style_photo_before.jpg`,
  STUDIO_STYLE_PHOTO_GIF: () =>
    `${getBananaProPrefix()}/studio_style_photo.gif`,
  OBJECT_INFRASTRUCTURE: () =>
    `${getBananaProPrefix()}/object_infrastructure_before.jpg`,
  OBJECT_INFRASTRUCTURE_GIF: () =>
    `${getBananaProPrefix()}/object_infrastructure.gif`,
  OUTFIT_SWAP: () => `${getBananaProPrefix()}/outfit_swap_before.jpg`,
  OUTFIT_SWAP_GIF: () => `${getBananaProPrefix()}/outfit_swap.gif`,
  ME_WITH_MY_PET_PRO: () =>
    `${getBananaProPrefix()}/me_with_my_pet_pro_before.png`,
  ME_WITH_MY_PET_PRO_GIF: () =>
    `${getBananaProPrefix()}/me_with_my_pet_pro.gif`,
  COMBINATION_PHOTO: () =>
    `${getBananaProPrefix()}/combination_photo_before.jpg`,
  COMBINATION_PHOTO_GIF: () => `${getBananaProPrefix()}/combination_photo.gif`,
  LINE_ART: () => `${getBananaProPrefix()}/line_art_before.jpg`,
  LINE_ART_GIF: () => `${getBananaProPrefix()}/line_art.gif`,
  NINE_HALF_LENGTH_PORTRAITS: () =>
    `${getBananaProPrefix()}/nine_half_length_portraits_before.jpg`,
  NINE_HALF_LENGTH_PORTRAITS_GIF: () =>
    `${getBananaProPrefix()}/nine_half_length_portraits.gif`,
  CLOTHING_EXTRACTION: () =>
    `${getBananaProPrefix()}/clothing_extraction_before.jpg`,
  CLOTHING_EXTRACTION_GIF: () =>
    `${getBananaProPrefix()}/clothing_extraction.gif`,
  KNITTED_WOOL_FOOD: () =>
    `${getBananaProPrefix()}/knitted_wool_food_before.jpg`,
  KNITTED_WOOL_FOOD_GIF: () => `${getBananaProPrefix()}/knitted_wool_food.gif`,
  PET_SURROUNDING: () => `${getBananaProPrefix()}/pet_surrounding_before.png`,
  PET_SURROUNDING_GIF: () => `${getBananaProPrefix()}/pet_surrounding.gif`,
  DRAWING_ASSISTANT: () =>
    `${getBananaProPrefix()}/drawing_assistant_before.jpg`,
  DRAWING_ASSISTANT_GIF: () => `${getBananaProPrefix()}/drawing_assistant.gif`,
  STORYBOARD_EXTEND_BORDER_LINE: () =>
    `${getBananaProPrefix()}/storyboard_extend_border_line_before.jpg`,
  STORYBOARD_EXTEND_BORDER_LINE_GIF: () =>
    `${getBananaProPrefix()}/storyboard_extend_border_line.gif`,

  // Halloween
  HORROR_KITCHEN: () => `${getAiArtPrefix()}/horror_kitchen.jpg`,
  SCARY_HOUSE: () => `${getAiArtPrefix()}/scary_house.jpg`,
  PENNYWISE: () => `${getAiArtPrefix()}/pennywise.jpg`,
  HALLOWEEN_PARTY: () => `${getAiArtPrefix()}/halloween_party_2.jpg`,
  FREAKY_CINEMA: () => `${getAiArtPrefix()}/freaky_cinema.jpg`,
  MIRROR: () => `${getAiArtPrefix()}/mirror.jpg`,
  HALLOWEEN_PORTRAIT: () => `${getAiArtPrefix()}/halloween_portrait.jpg`,
  DARK_UNO: () => `${getAiArtPrefix()}/dark_uno.jpg`,
  SHADOWN_MONARCH: () => `${getAiArtPrefix()}/shadown_monarch.jpg`,
  SUMMON: () => `${getAiArtPrefix()}/summon.jpg`,
  READING: () => `${getAiArtPrefix()}/reading.jpg`,
  PENNYWISE_CUSTOM: () => `${getAiArtPrefix()}/pennywise_custom.jpg`,
  HAPPY_DEATH_DATE: () => `${getAiArtPrefix()}/happy_death_date.jpg`,
});

export const WELCOME_SUGGESTIONS_IMAGE = defineLazy({
  // Image to Image
  DRAW_SNOWY_MOUNTAINS: () =>
    `${getWelcomeSuggestionsPrefix()}/image_to_image/draw_snowy_mountains.jpg`,
  WARM_STREET_ART_PHOTO: () =>
    `${getWelcomeSuggestionsPrefix()}/image_to_image/warm_street_art_photo.jpg`,
  DREAMY_FLORAL_GAZE: () =>
    `${getWelcomeSuggestionsPrefix()}/image_to_image/dreamy_floral_gaze.jpg`,
  WIND_KISSED_OUTDOOR_PORTRAIT: () =>
    `${getWelcomeSuggestionsPrefix()}/image_to_image/wind_kissed_outdoor_portrait.jpg`,
  GOLDEN_HOUR_CLOSEUP: () =>
    `${getWelcomeSuggestionsPrefix()}/image_to_image/golden_hour_closeup.jpg`,
  LIGHT_SHADOW_PORTRAIT: () =>
    `${getWelcomeSuggestionsPrefix()}/image_to_image/light_shadow_portrait.jpg`,
  VINTAGE_NIGHT_TONE: () =>
    `${getWelcomeSuggestionsPrefix()}/image_to_image/vintage_night_tone.jpg`,
  AQUARIUM_FILM_PORTRAIT: () =>
    `${getWelcomeSuggestionsPrefix()}/image_to_image/aquarium_film_portrait.jpg`,
  CANDID_SUNSET_AESTHETIC: () =>
    `${getWelcomeSuggestionsPrefix()}/image_to_image/candid_sunset_aesthetic.jpg`,
  CHIC_ELEVATOR_EDITORIAL: () =>
    `${getWelcomeSuggestionsPrefix()}/image_to_image/chic_elevator_editorial.jpg`,

  // Text to Image
  DRAW_SNOWY_MOUNTAINS_TEXT_TO_IMAGE: () =>
    `${getWelcomeSuggestionsPrefix()}/text_to_image/draw_snowy_mountains.jpg`,
  CUTE_CARTOON_CHARACTER: () =>
    `${getWelcomeSuggestionsPrefix()}/text_to_image/cute_cartoon_character.jpg`,
  PAINT_FANTASY_CASTLE: () =>
    `${getWelcomeSuggestionsPrefix()}/text_to_image/paint_fantasy_castle.jpg`,
  SHOW_GALAXY_SPACE_ART: () =>
    `${getWelcomeSuggestionsPrefix()}/text_to_image/show_galaxy_space_art.jpg`,
  RETRO_1980S_STYLE_NEON_TYPOGRAPHY: () =>
    `${getWelcomeSuggestionsPrefix()}/text_to_image/retro_1980s_style_neon_typography.jpg`,
  CREATE_FUTURISTIC_CITY: () =>
    `${getWelcomeSuggestionsPrefix()}/text_to_image/create_futuristic_city.jpg`,
  DESIGN_MINIMAL_LOGO: () =>
    `${getWelcomeSuggestionsPrefix()}/text_to_image/design_minimal_logo.jpg`,
  DARK_INDIE_ALBUM_COVER: () =>
    `${getWelcomeSuggestionsPrefix()}/text_to_image/dark_indie_album_cover.jpg`,
  DESIGN_AI_GENERATED_MEME: () =>
    `${getWelcomeSuggestionsPrefix()}/text_to_image/design_ai_generated_meme.jpg`,
  FUTURISTIC_SNEAKER_CONCEPT: () =>
    `${getWelcomeSuggestionsPrefix()}/text_to_image/futuristic_sneaker_concept.jpg`,

  // Info Query
  INFO_QUERY: () => `${getWelcomeSuggestionsPrefix()}/info_query.svg`,

  // Fun Social
  FUN_SOCIAL: () => `${getWelcomeSuggestionsPrefix()}/fun_social.svg`,

  // Deep Research
  DEEP_RESEARCH: () => `${getWelcomeSuggestionsPrefix()}/deep_research.svg`,
});
