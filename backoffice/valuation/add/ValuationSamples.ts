import type { Valuation } from "@selldone/core-js/models/shop/accounting/valuation/valuation.model";
import pizzaImage from "../../../assets/valuation/samples/pizza.png";
import notebookImage from "../../../assets/valuation/samples/notebook.png";
import jewelryImage from "../../../assets/valuation/samples/jewelry.png";
import cakeImage from "../../../assets/valuation/samples/cake.png";
import flowersImage from "../../../assets/valuation/samples/flowers.png";
import tshirtImage from "../../../assets/valuation/samples/tshirt.png";
import mugImage from "../../../assets/valuation/samples/mug.png";
import curtainsImage from "../../../assets/valuation/samples/curtains.png";
import printsImage from "../../../assets/valuation/samples/prints.png";
import cleaningImage from "../../../assets/valuation/samples/cleaning.png";

export interface ValuationSample {
  id: string;
  title: string;
  description: string;
  image: string;
  structure: Valuation.IDataItem[];
  conditions: { unavailable: string[] };
}

// Each load gets fresh editable data; sample amounts use the product's currency.
export function createValuationSamples(
  translate: (key: string) => string,
): ValuationSample[] {
  const samples: Omit<ValuationSample, "title" | "description">[] = [
    {
      id: "pizza",
      image: pizzaImage,
      structure: [
        {
          name: "size",
          title: "Pizza size",
          type: "select",
          pricing: true,
          sum: false,
          selects: ["Personal (8 inch)", "Medium (12 inch)", "Large (16 inch)"],
          lookup: {
            "Personal (8 inch)": 1,
            "Medium (12 inch)": 1.4,
            "Large (16 inch)": 1.8,
          },
        },
        {
          name: "crust",
          title: "Crust",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Classic crust", "Thin crust", "Stuffed crust"],
          lookup: { "Classic crust": 0, "Thin crust": 0, "Stuffed crust": 3 },
        },
        {
          name: "sauce",
          title: "Sauce",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Tomato sauce", "Pesto sauce", "Cream sauce"],
          lookup: { "Tomato sauce": 0, "Pesto sauce": 1.5, "Cream sauce": 1 },
        },
        {
          name: "extra-cheese",
          title: "Extra cheese",
          type: "switch",
          pricing: true,
          sum: true,
          lookup: { true: 2, false: 0 },
          true_title: "Add extra cheese",
          false_title: "Regular cheese",
        },
        {
          name: "mushrooms",
          title: "Mushroom topping",
          type: "switch",
          pricing: true,
          sum: true,
          lookup: { true: 1.5, false: 0 },
          true_title: "Add mushrooms",
          false_title: "No extra mushrooms",
        },
      ],
      conditions: { unavailable: ["Personal (8 inch):Stuffed crust"] },
    },
    {
      id: "notebook",
      image: notebookImage,
      structure: [
        {
          name: "size",
          title: "Paper size",
          type: "select",
          pricing: true,
          sum: false,
          selects: ["A6 pocket", "A5 notebook", "A4 notebook"],
          lookup: { "A6 pocket": 1, "A5 notebook": 1.3, "A4 notebook": 1.8 },
        },
        {
          name: "cover",
          title: "Cover",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Soft cover", "Hard cover", "Linen cover"],
          lookup: { "Soft cover": 0, "Hard cover": 5, "Linen cover": 8 },
        },
        {
          name: "binding",
          title: "Binding",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Stapled binding", "Spiral binding", "Perfect binding"],
          lookup: {
            "Stapled binding": 0,
            "Spiral binding": 2,
            "Perfect binding": 4,
          },
        },
        {
          name: "cover-text",
          title: "Personalized cover text",
          type: null,
          pricing: false,
        },
      ],
      conditions: { unavailable: ["Hard cover:Stapled binding"] },
    },
    {
      id: "jewelry",
      image: jewelryImage,
      structure: [
        {
          name: "metal",
          title: "Metal",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Sterling silver", "Gold plated", "Solid gold"],
          lookup: {
            "Sterling silver": 0,
            "Gold plated": 25,
            "Solid gold": 200,
          },
        },
        {
          name: "gemstone",
          title: "Gemstone",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["No gemstone", "Quartz", "Sapphire"],
          lookup: { "No gemstone": 0, Quartz: 15, Sapphire: 60 },
        },
        {
          name: "engraving",
          title: "Engraving",
          type: "switch",
          pricing: true,
          sum: true,
          lookup: { true: 10, false: 0 },
          true_title: "Add engraving",
          false_title: "No engraving",
        },
        {
          name: "engraving-text",
          title: "Engraving text",
          type: null,
          pricing: false,
        },
      ],
      conditions: { unavailable: [] },
    },
    {
      id: "cake",
      image: cakeImage,
      structure: [
        {
          name: "size",
          title: "Cake size",
          type: "select",
          pricing: true,
          sum: false,
          selects: [
            "Small (6 servings)",
            "Medium (12 servings)",
            "Large (20 servings)",
          ],
          lookup: {
            "Small (6 servings)": 1,
            "Medium (12 servings)": 1.6,
            "Large (20 servings)": 2.4,
          },
        },
        {
          name: "filling",
          title: "Filling",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Vanilla filling", "Chocolate filling", "Berry filling"],
          lookup: {
            "Vanilla filling": 0,
            "Chocolate filling": 4,
            "Berry filling": 6,
          },
        },
        {
          name: "decoration",
          title: "Decoration",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Buttercream finish", "Fondant finish", "Two-tier finish"],
          lookup: {
            "Buttercream finish": 0,
            "Fondant finish": 12,
            "Two-tier finish": 25,
          },
        },
        {
          name: "cake-message",
          title: "Cake message",
          type: null,
          pricing: false,
        },
      ],
      conditions: { unavailable: ["Small (6 servings):Two-tier finish"] },
    },
    {
      id: "flowers",
      image: flowersImage,
      structure: [
        {
          name: "bouquet-size",
          title: "Bouquet size",
          type: "select",
          pricing: true,
          sum: false,
          selects: ["Standard bouquet", "Deluxe bouquet", "Grand bouquet"],
          lookup: {
            "Standard bouquet": 1,
            "Deluxe bouquet": 1.5,
            "Grand bouquet": 2,
          },
        },
        {
          name: "wrapping",
          title: "Wrapping",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Paper wrap", "Fabric wrap", "Gift basket"],
          lookup: { "Paper wrap": 0, "Fabric wrap": 5, "Gift basket": 12 },
        },
        {
          name: "vase",
          title: "Vase",
          type: "switch",
          pricing: true,
          sum: true,
          lookup: { true: 10, false: 0 },
          true_title: "Include a vase",
          false_title: "Bouquet only",
        },
        {
          name: "card-message",
          title: "Gift card message",
          type: null,
          pricing: false,
        },
      ],
      conditions: { unavailable: ["Grand bouquet:Gift basket"] },
    },
    {
      id: "tshirt",
      image: tshirtImage,
      structure: [
        {
          name: "print-placement",
          title: "Print placement",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Front print", "Back print", "Front and back print"],
          lookup: {
            "Front print": 0,
            "Back print": 3,
            "Front and back print": 7,
          },
        },
        {
          name: "print-method",
          title: "Decoration method",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Single-color print", "Full-color print", "Embroidery"],
          lookup: {
            "Single-color print": 0,
            "Full-color print": 5,
            Embroidery: 10,
          },
        },
        {
          name: "print-text",
          title: "Personalized text",
          type: null,
          pricing: false,
        },
      ],
      conditions: { unavailable: ["Front and back print:Embroidery"] },
    },
    {
      id: "mug",
      image: mugImage,
      structure: [
        {
          name: "finish",
          title: "Mug finish",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Glossy finish", "Matte finish", "Color-changing finish"],
          lookup: {
            "Glossy finish": 0,
            "Matte finish": 2,
            "Color-changing finish": 4,
          },
        },
        {
          name: "print-area",
          title: "Print area",
          type: "select",
          pricing: true,
          sum: true,
          selects: [
            "Single-side design",
            "Double-side design",
            "Wraparound design",
          ],
          lookup: {
            "Single-side design": 0,
            "Double-side design": 2,
            "Wraparound design": 3,
          },
        },
        {
          name: "gift-box",
          title: "Gift box",
          type: "switch",
          pricing: true,
          sum: true,
          lookup: { true: 4, false: 0 },
          true_title: "Add gift box",
          false_title: "Standard packaging",
        },
        {
          name: "mug-text",
          title: "Personalized message",
          type: null,
          pricing: false,
        },
      ],
      conditions: { unavailable: [] },
    },
    {
      id: "curtains",
      image: curtainsImage,
      structure: [
        {
          name: "drop",
          title: "Curtain drop",
          type: "select",
          pricing: true,
          sum: false,
          selects: ["200 cm drop", "250 cm drop", "300 cm drop"],
          lookup: { "200 cm drop": 1, "250 cm drop": 1.25, "300 cm drop": 1.5 },
        },
        {
          name: "lining",
          title: "Lining",
          type: "select",
          pricing: true,
          sum: true,
          selects: [
            "Unlined curtain",
            "Light-filtering lining",
            "Blackout lining",
          ],
          lookup: {
            "Unlined curtain": 0,
            "Light-filtering lining": 15,
            "Blackout lining": 25,
          },
        },
        {
          name: "heading",
          title: "Heading style",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Pencil pleat", "Eyelet heading", "Pinch pleat"],
          lookup: { "Pencil pleat": 0, "Eyelet heading": 8, "Pinch pleat": 12 },
        },
      ],
      conditions: { unavailable: [] },
    },
    {
      id: "prints",
      image: printsImage,
      structure: [
        {
          name: "print-size",
          title: "Print size",
          type: "select",
          pricing: true,
          sum: false,
          selects: ["A4 print", "A3 print", "A2 print"],
          lookup: { "A4 print": 1, "A3 print": 1.6, "A2 print": 2.5 },
        },
        {
          name: "paper",
          title: "Paper finish",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["Matte paper", "Gloss paper", "Cotton art paper"],
          lookup: { "Matte paper": 0, "Gloss paper": 3, "Cotton art paper": 8 },
        },
        {
          name: "frame",
          title: "Frame",
          type: "select",
          pricing: true,
          sum: true,
          selects: ["No frame", "Wood frame", "Metal frame"],
          lookup: { "No frame": 0, "Wood frame": 20, "Metal frame": 25 },
        },
      ],
      conditions: { unavailable: ["A2 print:Metal frame"] },
    },
    {
      id: "cleaning",
      image: cleaningImage,
      structure: [
        {
          name: "cleaning-package",
          title: "Cleaning package",
          type: "select",
          pricing: true,
          sum: false,
          selects: ["Maintenance clean", "Deep clean"],
          lookup: { "Maintenance clean": 1, "Deep clean": 1.75 },
        },
        {
          name: "additional-rooms",
          title: "Additional rooms",
          type: "number",
          pricing: true,
          sum: true,
          factor: 15,
          default: 0,
        },
        {
          name: "oven-cleaning",
          title: "Oven cleaning",
          type: "switch",
          pricing: true,
          sum: true,
          lookup: { true: 20, false: 0 },
          true_title: "Include oven cleaning",
          false_title: "No oven cleaning",
        },
        {
          name: "window-cleaning",
          title: "Interior windows",
          type: "switch",
          pricing: true,
          sum: true,
          lookup: { true: 12, false: 0 },
          true_title: "Include window cleaning",
          false_title: "No window cleaning",
        },
        {
          name: "access-notes",
          title: "Access instructions",
          type: null,
          pricing: false,
        },
      ],
      conditions: { unavailable: [] },
    },
  ];

  return samples.map((sample) => ({
    ...sample,
    title: translate(`valuation_add.samples.catalog.${sample.id}.title`),
    description: translate(
      `valuation_add.samples.catalog.${sample.id}.description`,
    ),
  }));
}
