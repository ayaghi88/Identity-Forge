
import { GoogleGenAI } from "@google/genai";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to generate a single image variation using multiple reference images.
 */
const generateSingleVariation = async (cleanImages: string[], prompt: string, attempt = 1): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const imageParts = cleanImages.map(img => ({
      inlineData: {
        data: img,
        mimeType: 'image/jpeg',
      },
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          ...imageParts,
          {
            text: `You are an expert VFX artist and photo retoucher. 
            
            INSTRUCTION: "${prompt}"
            
            STRICT EXECUTION GUIDELINES:
            1. IDENTITY: You MUST preserve the facial features, identity, and expression seen in the provided reference images.
            2. STYLE: Unless explicitly asked for a cartoon/painting, the result must be PHOTOREALISTIC 8K.
            3. COMPOSITION: Seamlessly blend the subject into the requested environment.
            
            Execute this transformation now.`,
          },
        ],
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data in response");
  } catch (error: any) {
    const isRateLimit = error.status === 429 || error.code === 429 || (error.message && error.message.includes('429'));
    if (attempt <= 2 && isRateLimit) {
      const delay = 15000 * Math.pow(2, attempt - 1);
      await wait(delay); 
      return generateSingleVariation(cleanImages, prompt, attempt + 1);
    }
    throw error;
  }
};

export const generateVariations = async (
  base64Images: string[], 
  prompt: string,
  onProgress?: (index: number, total: number) => void
): Promise<string[]> => {
  const cleanImages = base64Images.map(img => img.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ''));
  const successfulImages: string[] = [];
  const variationCount = 3; 

  for (let i = 0; i < variationCount; i++) {
    if (onProgress) onProgress(i + 1, variationCount);
    if (i > 0) await wait(12000); 
    const img = await generateSingleVariation(cleanImages, prompt);
    successfulImages.push(img);
  }
  return successfulImages;
};

export const generateVideo = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await wait(10000);
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed to return a URI");
  
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
