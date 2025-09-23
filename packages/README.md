# Nano Banana Reusable Packages

This directory contains two reusable packages extracted from the Nano Banana application that can be easily integrated into other Node.js projects.

## 📦 Packages Overview

### 1. AI Chatbot with GitHub Integration (`ai-chatbot-github/`)

A complete chatbot solution with:
- **Multi-LLM Support**: OpenAI and Anthropic Claude
- **Repository Context**: Search and include project files in conversations
- **Web Search**: DuckDuckGo integration for real-time information
- **GitHub Issues**: Automatically create GitHub issues from user feedback
- **AI Enhancement**: Expand simple feedback into structured issue reports

### 2. Nano Banana Image Generation API (`nano-banana-api/`)

AI-powered image generation using Google Gemini:
- **Text-to-Image**: Generate images from descriptive prompts
- **Image Processing**: Handle base64 and URL conversions
- **Safety Filters**: Content policy detection and handling
- **Hotel/Restaurant Optimized**: Perfect for room and food imagery

## 🚀 Quick Start

### For Hotel/Restaurant Applications

```typescript
// Generate room images
import { handleImageGeneration, enhancePromptForHotel } from './packages/nano-banana-api'

const generateRoomImage = async (roomType: string, amenities: string[]) => {
  const basePrompt = `${roomType} with ${amenities.join(', ')}`
  const enhancedPrompt = enhancePromptForHotel(basePrompt)

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: enhancedPrompt })
  })

  return response.json()
}

// Example: Generate images for different room types
const roomImages = await Promise.all([
  generateRoomImage("Double bedroom", ["king bed", "city view", "marble bathroom"]),
  generateRoomImage("Restaurant dining area", ["elegant lighting", "modern furniture"]),
  generateRoomImage("Hotel lobby", ["marble floors", "chandelier", "reception desk"])
])
```

### Chatbot for Customer Support

```typescript
import { handleChatRequest } from './packages/ai-chatbot-github'

// API route: /api/chat
export async function POST(request: Request) {
  return handleChatRequest(request)
}

// Frontend usage
const askQuestion = async (question: string) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: question }],
      mode: 'general' // or 'repo' for project-specific questions
    })
  })

  const data = await response.json()
  return data.message
}

// Example questions for hotel guests
const responses = await Promise.all([
  askQuestion("What amenities do you offer?"),
  askQuestion("How do I make a reservation?"),
  askQuestion("What are your check-in hours?")
])
```

## 🛠 Installation Guide

### 1. Copy Package Files

```bash
# Copy the packages to your project
cp -r ./packages/ai-chatbot-github /path/to/your/project/
cp -r ./packages/nano-banana-api /path/to/your/project/
```

### 2. Install Dependencies

```bash
# For chatbot functionality
npm install @octokit/rest openai

# For image generation
npm install @google/generative-ai

# Both packages work with Next.js 14+
npm install next@latest
```

### 3. Environment Configuration

Create a `.env.local` file in your project:

```env
# AI Chatbot (choose one or both)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# GitHub Integration (for issue creation)
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_username_or_org
GITHUB_REPO=your_repository_name

# Image Generation
GEMINI_API_KEY=your_gemini_api_key

# Optional: Model preferences
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-sonnet-20240229
GEMINI_MODEL=gemini-2.5-flash-image-preview
```

### 4. API Routes Setup

#### For Next.js App Router:

```typescript
// app/api/chat/route.ts
import { handleChatRequest } from '../../../packages/ai-chatbot-github'
export async function POST(request: Request) {
  return handleChatRequest(request)
}

// app/api/generate-image/route.ts
import { handleImageGeneration } from '../../../packages/nano-banana-api'
export async function POST(request: Request) {
  return handleImageGeneration(request)
}

// app/api/report-issue/route.ts
import { handleIssueReport } from '../../../packages/ai-chatbot-github'
export async function POST(request: Request) {
  return handleIssueReport(request)
}
```

#### For Next.js Pages Router:

```typescript
// pages/api/chat.ts
import { handleChatRequest } from '../../packages/ai-chatbot-github'
export default handleChatRequest

// pages/api/generate-image.ts
import { handleImageGeneration } from '../../packages/nano-banana-api'
export default handleImageGeneration

// pages/api/report-issue.ts
import { handleIssueReport } from '../../packages/ai-chatbot-github'
export default handleIssueReport
```

## 🏨 Hotel & Restaurant Use Cases

### Dynamic Room Image Generation

```typescript
const HotelBookingPage = () => {
  const [roomImage, setRoomImage] = useState<string>()

  const generateRoomPreview = async (roomData: {
    type: string
    amenities: string[]
    view: string
  }) => {
    const prompt = `${roomData.type} hotel room with ${roomData.amenities.join(', ')}, ${roomData.view} view, luxury hotel photography style`

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })

    const data = await response.json()
    setRoomImage(data.imageUrl)
  }

  return (
    <div>
      <button onClick={() => generateRoomPreview({
        type: "Deluxe Suite",
        amenities: ["king bed", "jacuzzi", "balcony", "city view"],
        view: "ocean"
      })}>
        Generate Room Preview
      </button>
      {roomImage && <img src={roomImage} alt="Room preview" />}
    </div>
  )
}
```

### Restaurant Menu with AI Images

```typescript
const MenuItem = ({ dish }: { dish: { name: string, ingredients: string[], cuisine: string } }) => {
  const [dishImage, setDishImage] = useState<string>()

  useEffect(() => {
    const generateDishImage = async () => {
      const prompt = `${dish.name} made with ${dish.ingredients.join(', ')}, ${dish.cuisine} cuisine style, professional food photography, appetizing presentation`

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      const data = await response.json()
      setDishImage(data.imageUrl)
    }

    generateDishImage()
  }, [dish])

  return (
    <div className="menu-item">
      {dishImage && <img src={dishImage} alt={dish.name} />}
      <h3>{dish.name}</h3>
      <p>Ingredients: {dish.ingredients.join(', ')}</p>
    </div>
  )
}
```

### Customer Support Chatbot

```typescript
const CustomerSupportChat = () => {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [input, setInput] = useState('')

  const sendMessage = async () => {
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: newMessages,
        mode: 'general',
        // Customize system prompt for hotel context
        systemPrompt: 'You are a helpful hotel concierge assistant. Help guests with reservations, amenities, local recommendations, and general inquiries.'
      })
    })

    const data = await response.json()
    setMessages([...newMessages, { role: 'assistant', content: data.message }])
    setInput('')
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about our hotel services..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}
```

## 🔧 Customization

### Custom System Prompts

```typescript
// For hotel chatbot
const hotelSystemPrompt = `You are the AI concierge for [Hotel Name]. Help guests with:
- Room reservations and availability
- Hotel amenities and services
- Local attractions and recommendations
- Dining options and restaurant reservations
- Transportation and directions
Be friendly, professional, and knowledgeable about hospitality.`

// For restaurant chatbot
const restaurantSystemPrompt = `You are the AI host for [Restaurant Name]. Assist customers with:
- Menu recommendations and dietary restrictions
- Reservation booking and availability
- Special events and private dining
- Wine pairings and beverage suggestions
- Takeout and delivery options
Maintain a warm, welcoming tone that reflects our dining experience.`
```

### Enhanced Image Prompts

```typescript
import { enhancePromptForHotel, enhancePromptForRestaurant } from './packages/nano-banana-api'

// Automatic prompt enhancement
const generateHotelImage = async (description: string) => {
  const enhancedPrompt = enhancePromptForHotel(description)
  // Results in professional hotel photography with proper lighting and composition
}

const generateFoodImage = async (description: string) => {
  const enhancedPrompt = enhancePromptForRestaurant(description)
  // Results in appetizing food photography with restaurant-quality presentation
}
```

## 📚 Documentation

- **[AI Chatbot GitHub Package](./ai-chatbot-github/README.md)** - Complete chatbot documentation
- **[Nano Banana API Package](./nano-banana-api/README.md)** - Image generation API documentation

## 🚀 Deployment Tips

1. **API Keys**: Store all API keys securely in environment variables
2. **Rate Limiting**: Consider implementing rate limiting for public APIs
3. **Caching**: Cache generated images to reduce API calls and costs
4. **Error Handling**: Implement proper error boundaries in your React components
5. **Monitoring**: Log API usage for monitoring costs and performance

## 📄 License

Both packages are released under the MIT License, making them free to use in commercial and non-commercial projects.

## 🤝 Support

Each package includes comprehensive error handling and logging. Check the individual README files for troubleshooting guides and common issues.