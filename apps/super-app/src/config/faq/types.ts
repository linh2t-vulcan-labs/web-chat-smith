export interface TQuestionAccordionRaw {
  id: number;
  question: string;
  shortAnswer?: string;
  answer: string;
}

export interface TQuestionCategoryRaw {
  id: number;
  category: string;
  icon: string;
  description: string;
  questions: TQuestionAccordionRaw[];
}

export type TQuestionAccordion = TQuestionAccordionRaw & {
  slug: string;
};

export type TQuestionCategory = Omit<TQuestionCategoryRaw, "questions"> & {
  slug: string;
  questions: TQuestionAccordion[];
};
