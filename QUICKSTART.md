# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or remote)
- OpenAI API key

## Setup Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   - Copy `.env.example` to `.env`
   - Add your `OPENAI_API_KEY`
   - Add your `DATABASE_URL` (e.g., `postgresql://user:password@localhost:5432/knowledge_qa`)

3. **Initialize database**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing the Application

1. **Upload a document**:
   - Go to `/upload`
   - Upload a `.txt` file (max 1MB)
   - Wait for processing

2. **View documents**:
   - Go to `/documents`
   - See your uploaded documents with chunk counts

3. **Ask a question**:
   - Go to `/ask`
   - Enter a question about your uploaded content
   - View the answer with source attribution

4. **Check status**:
   - Go to `/status`
   - Verify all services are healthy

## Troubleshooting

- **Database connection error**: Verify `DATABASE_URL` is correct and PostgreSQL is running
- **OpenAI API error**: Check your API key is valid and has credits
- **Migration errors**: Ensure PostgreSQL is accessible and you have proper permissions
