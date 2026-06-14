import { describe, expect, it } from "vitest";
import { parseListingText, serializeListingsToText, serializeListingToText } from "@/lib/listing-text-import";

const validBlock = `Make: Porsche
Model: Panamera
Year: 2025
Price HUF: 44990000
Mileage: 6730
Fuel: Hybrid
Transmission: Automatic
Body: Wagon
Condition: Like new
Location: Budapest
Description: |
  Ujszeru, gazdagon felszerelt plug-in hibrid kombi.
  Magyar okmanyokkal, panoramatetovel.`;

describe("listing text import", () => {
  it("parses multiple blocks split by separators", () => {
    const result = parseListingText(`${validBlock}\n---\n${validBlock.replace("Porsche", "Toyota")}`, "en");

    expect(result.validCount).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[1].raw.make).toBe("Toyota");
  });

  it("keeps multiline field content", () => {
    const result = parseListingText(validBlock, "en");

    expect(result.items[0].ok).toBe(true);
    expect(result.items[0].raw.description).toContain("Magyar okmanyokkal");
  });

  it("normalizes English and Hungarian enum labels", () => {
    const result = parseListingText(
      validBlock
        .replace("Fuel: Hybrid", "Fuel: Hibrid")
        .replace("Transmission: Automatic", "Transmission: Automata")
        .replace("Body: Wagon", "Body: Kombi")
        .replace("Condition: Like new", "Condition: Ujszeru"),
      "hu",
    );

    expect(result.items[0].ok).toBe(true);
    expect(result.items[0].raw.fuel).toBe("HYBRID");
    expect(result.items[0].raw.transmission).toBe("AUTOMATIC");
    expect(result.items[0].raw.bodyType).toBe("WAGON");
    expect(result.items[0].raw.condition).toBe("LIKE_NEW");
  });

  it("normalizes boolean aliases", () => {
    const result = parseListingText(`${validBlock}\nVAT deductible: igen\nAvailable immediately: 0`, "en");

    expect(result.items[0].raw.vatDeductible).toBe("true");
    expect(result.items[0].raw.availableImmediately).toBe("false");
  });

  it("reports unknown fields as warnings", () => {
    const result = parseListingText(`${validBlock}\nMystery: value`, "en");

    expect(result.items[0].warnings).toEqual(["Unknown field: Mystery"]);
  });

  it("marks invalid listings without blocking valid siblings", () => {
    const result = parseListingText(`${validBlock}\n---\nMake: Broken`, "en");

    expect(result.validCount).toBe(1);
    expect(result.invalidCount).toBe(1);
    expect(result.items[1].ok).toBe(false);
  });

  it("forces imported listings to draft", () => {
    const result = parseListingText(`${validBlock}\nStatus: PUBLISHED`, "en");

    expect(result.items[0].ok).toBe(true);
    if (result.items[0].ok) {
      expect(result.items[0].data.status).toBe("DRAFT");
    }
  });

  it("serializes one listing and parses it back into equivalent fields", () => {
    const text = serializeListingToText(
      {
        make: "Porsche",
        model: "Panamera",
        trim: "Turbo S E-Hybrid Sport Turismo",
        year: 2025,
        yearMonth: "2025/9",
        price: 44990000,
        priceEur: 127037,
        mileage: 6730,
        fuel: "HYBRID",
        transmission: "AUTOMATIC",
        bodyType: "WAGON",
        condition: "LIKE_NEW",
        location: "Budapest",
        description: "Line one with enough listing detail\nLine two with enough listing detail",
        color: "Sarga",
        trunkVolumeLiters: 418,
        vatDeductible: true,
        availableImmediately: false,
        status: "PUBLISHED",
      },
      "en",
    );
    const result = parseListingText(text, "en");

    expect(result.validCount).toBe(1);
    expect(result.items[0].ok).toBe(true);
    if (result.items[0].ok) {
      expect(result.items[0].data).toMatchObject({
        make: "Porsche",
        model: "Panamera",
        trim: "Turbo S E-Hybrid Sport Turismo",
        year: 2025,
        yearMonth: "2025/9",
        price: 44990000,
        priceEur: 127037,
        mileage: 6730,
        fuel: "HYBRID",
        transmission: "AUTOMATIC",
        bodyType: "WAGON",
        condition: "LIKE_NEW",
        location: "Budapest",
        color: "Sarga",
        trunkVolumeLiters: 418,
        vatDeductible: true,
        availableImmediately: false,
        status: "DRAFT",
      });
      expect(result.items[0].data.description).toContain("Line two");
    }
  });

  it("exports multiple listings separated by block markers", () => {
    const text = serializeListingsToText(
      [
        {
          make: "Porsche",
          model: "Panamera",
          year: 2025,
          price: 44990000,
          mileage: 6730,
          fuel: "HYBRID",
          transmission: "AUTOMATIC",
          bodyType: "WAGON",
          condition: "LIKE_NEW",
          location: "Budapest",
          description: "First listing with enough detail.",
        },
        {
          make: "Toyota",
          model: "Corolla",
          year: 2021,
          price: 7390000,
          mileage: 64200,
          fuel: "HYBRID",
          transmission: "AUTOMATIC",
          bodyType: "WAGON",
          condition: "WELL_KEPT",
          location: "Budapest XI.",
          description: "Second listing with enough detail.",
        },
      ],
      "en",
    );

    expect(text).toContain("\n---\n");
    expect(parseListingText(text, "en").validCount).toBe(2);
  });
});
