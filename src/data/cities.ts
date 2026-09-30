import { cityGroup1 } from "./city-group-1";
import { cityGroup2 } from "./city-group-2";
import { cityGroup3 } from "./city-group-3";
import { cityGroup4 } from "./city-group-4";
import { cityGroup5 } from "./city-group-5";
import { cityGroup6 } from "./city-group-6";
import { cityGroup7 } from "./city-group-7";
export interface Faq { q: string; a: string }
export interface Step { title: string; text: string }
export interface Scenario { title: string; intro: string; items: string[]; outro: string }
export interface City {
  slug: string;
  name: string;
  state: string;
  stateName: string;
  county: string;
  formName: string;
  title: string;
  description: string;
  h1Bottom: string;
  hero: string;
  localNoteTitle: string;
  localNote: string;
  whyHeading: string;
  why: string[];
  steps: Step[];
  faqs: Faq[];
  nearby: string[];
  summaryFees?: boolean;
  summarySteps?: boolean;
  scenario?: Scenario;
  blurb: string;
}

export const brand = "Tampa Wholesale Double Close";
export const domain = "tampa.wholesaledoubleclose.click";
export const trustBar = ["Published funding fees", "Purchase and resale review", "Serving Tampa Bay wholesalers"];
export const cities: City[] = [...cityGroup1, ...cityGroup2, ...cityGroup3, ...cityGroup4, ...cityGroup5, ...cityGroup6, ...cityGroup7];
