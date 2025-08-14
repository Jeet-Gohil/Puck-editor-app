    // app/api/generate-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateAIField } from '@/app/utils/AIDataHandler';

interface GenerateAIRequest {
  elementId: string;
  fieldName: string;
  fieldType: string;
  currentValue?: string;
  prompt?: string;
}

interface GenerateAIResponse {
  success: boolean;
  elementId?: string;
  fieldName?: string;
  generatedValue?: string;
  message?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateAIResponse>> {
  try {
    const body: GenerateAIRequest = await request.json();
    const { elementId, fieldName, fieldType, currentValue, prompt } = body;

    // Generate AI content (replace with actual AI service)
    const generatedContent = generateAIContent(fieldType, currentValue, prompt);
    
    // Update JSON file
    const success = updateAIField(elementId, fieldName, generatedContent, fieldType);
    
    if (success) {
      return NextResponse.json({
        success: true,
        elementId,
        fieldName,
        generatedValue: generatedContent
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to save data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { success: false, message: 'AI generation failed' },
      { status: 500 }
    );
  }
}

// Mock AI content generation function - replace with real AI service
function generateAIContent(fieldType: string, currentValue?: string, prompt?: string): string {
  const aiTemplates: Record<string, string[]> = {
    title: [
      "Revolutionary Digital Solutions",
      "Transform Your Business Today",
      "Next-Generation Platform",
      "Empowering Innovation Excellence",
      "Smart Technology Solutions"
    ],
    description: [
      "Discover cutting-edge solutions that revolutionize your workflow and boost productivity with our advanced platform designed for modern businesses.",
      "Experience seamless integration and powerful features that elevate your business to new heights with intelligent automation and analytics.",
      "Unlock the potential of digital transformation with our comprehensive suite of tools, services, and expert guidance.",
      "Streamline operations and accelerate growth with our innovative platform that adapts to your unique business needs.",
      "Join thousands of satisfied customers who have transformed their operations with our award-winning technology solutions."
    ],
    text: [
      "Get Started Today",
      "Learn More", 
      "Try It Free",
      "Contact Sales",
      "Book a Demo",
      "Start Your Journey",
      "Explore Features"
    ]
  };

  const templates = aiTemplates[fieldType] || aiTemplates.text;
  return templates[Math.floor(Math.random() * templates.length)];
}
