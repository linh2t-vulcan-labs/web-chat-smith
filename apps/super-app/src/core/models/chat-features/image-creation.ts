import { Exclude, Expose, Transform } from "@/libs/class-transformer";
import { mapDtoToMessageTemp } from "@/utils/mappers/conversations";

import type { TMessageTemp } from "../conversation";

export enum EAIART_TYPE {
  TEXT_TO_IMAGE = "TEXT_TO_IMAGE",
  IMAGE_TO_IMAGE = "IMAGE_TO_IMAGE",
}

export enum EAIART_STYLE {
  NONE = "none",

  // Chat Smith
  PAINTING = "painting",
  _3D = "3d",
  REALISTIC = "realistic",
  CARTOON = "cartoon",
  CYBERPUNK = "cyberpunk",
  DIGITAL_ART = "digital_art",
  FANTASY = "fantasy",
  ANIME = "anime",
  CHIBI = "chibi",
  WATERCOLOR = "watercolor",
  POP_ART = "pop_art",
  SKETCH = "sketch",
  NOIR = "noir",
  ABSTRACT = "abstract",
  LOW_POLY = "low_poly",

  // GPT
  THE_SIMPSONS = "the_simpson",
  SOUTH_PARK = "south_park",
  SAILOR_MOON = "sailor_moon",
  RICK_AND_MORTY = "rick_and_morty",
  ONE_PIECE = "one_piece",
  NARUTO = "naruto",
  MANGA = "manga",
  GHIBLI = "ghibli",
  GENSHIN_IMPACT = "genshin_impact",
  DRAGON_BALL = "dragon_ball",
  DORAEMON = "doraemon",
  DISNEY_3D = "disney_3d",
  DEMON_SLAYER = "demon_slayer",
  BLEACH = "bleach",
  ATTACK_ON_TITAN = "attack_on_titan",

  // GPT Image 1.5
  CARICATURE_1 = "caricature_1",
  CARICATURE_2 = "caricature_2",
  CARICATURE_3 = "caricature_3",
  CARICATURE_4 = "caricature_4",
  CARICATURE_5 = "caricature_5",
  CARICATURE_6 = "caricature_6",
  PHINEAS_AND_FERB_TRANSFORM = "cartoon_transform",
  CARICATURE_COUPLE = "funny_couple_cartoon",

  // Nano Banana
  REALISTIC_FIGURE = "realistic_figurine",
  ART_GALLEY = "art_gallery",
  AUTUMN = "autumn",
  BIRTHDAY = "birthday_girl",
  DOUBLE_POTRAIT = "double_portrait",
  MEOWCHIC = "meowchic",
  MOUNT_FUJI = "mount_fuji",
  PARIS = "eiffel_tower",
  POSTER_DESIGN = "poster_design",
  SANTORINI = "santorini",
  SPOTIFY = "spotify",
  STUDIO_PORTRAIT = "studio_portrait",
  TAJ_MAHAL = "taj_mahal",
  VENICE = "venice",
  WINTER = "winter",
  ROME = "colosseum",

  // Nano Banana Pro
  GASHAPON_CAPSULE = "gashapon_capsule",
  ANATOMICAL_INFOTAGRAPH = "anatomical_infographic",
  PRODUCT_TECHNICAL_VIEW = "product_technical_view",
  POSTER_CREATION = "poster_creation",
  INGREDIENTS = "ingredients",
  STUDIO_STYLE_PHOTO = "studio_style_photo",
  OBJECT_INFRASTRUCTURE = "object_infrastructure",
  OUTFIT_SWAP = "outfit_swap",
  ME_WITH_MY_PET_PRO = "me_with_my_pet_pro",
  COMBINATION_PHOTO = "combination_photo",
  LINE_ART = "line_art",
  NINE_HALF_LENGTH_PORTRAITS = "nine_half_length_portraits",
  CLOTHING_EXTRACTION = "clothing_extraction",
  KNITTED_WOOL_FOOD = "knitted_wool_food",
  PET_SURROUNDING = "pet_surrounding",
  DRAWING_ASSISTANT = "drawing_assistant",
  STORYBOARD_EXTEND_BORDER_LINE = "storyboard_extend_border_line",

  // Halloween
  HORROR_KITCHEN = "horror_kitchen",
  SCARY_HOUSE = "scary_house",
  PENNYWISE = "pennywise",
  HALLOWEEN_PARTY = "halloween_party",
  FREAKY_CINEMA = "freaky_cinema",
  MIRROR = "mirror",
  HALLOWEEN_PORTRAIT = "halloween_portrait",
  DARK_UNO = "dark_uno",
  SHADOWN_MONARCH = "shadown_monarch",
  SUMMON = "summon",
  READING = "reading",
  PENNYWISE_CUSTOM = "pennywise_custom",
  HAPPY_DEATH_DATE = "happy_death_date",
}

@Exclude()
export class ChatTextToImageResponseModel {
  @Expose({ name: "data" })
  @Transform(({ value }) => {
    if (!value) {
      return null;
    }

    return mapDtoToMessageTemp(value);
  })
  message!: TMessageTemp;
}

@Exclude()
export class ImageToImageResponseModel {
  @Expose({ name: "process_id" })
  processId!: string;
}
