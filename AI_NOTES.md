# AI Usage Notes

This document provides transparency about the use of AI tools in building this project.

## AI Tools Used

### Primary Tool
- **Claude Sonnet 4.5** (via Cursor IDE)

## What AI Was Used For

### 1. Boilerplate Setup
- Initial Next.js project structure
- TypeScript configuration
- TailwindCSS setup
- Prisma schema initial draft
- Package.json dependencies

### 2. Initial Code Generation
- API route structure and error handling patterns
- Frontend page components with React hooks
- Utility library skeletons (chunking, embeddings, similarity, RAG)
- Database schema design suggestions

### 3. Code Patterns
- Consistent error handling across API routes
- TypeScript type definitions
- Navigation structure

## What Was Manually Reviewed and Verified

### 1. Cosine Similarity Implementation
- **Review**: Manually verified the mathematical correctness of the cosine similarity function
- **Verification**: Checked that dot product, vector norms, and division are correctly implemented
- **Testing**: Verified with known test vectors to ensure correct results

### 2. Prompt Grounding Logic
- **Review**: Carefully reviewed the LLM prompt to ensure it explicitly instructs the model to only use provided context
- **Verification**: Confirmed the prompt structure: context → question → answer instruction
- **Edge Cases**: Verified handling when no relevant chunks are found

### 3. Error Handling
- **Review**: Manually reviewed all error paths:
  - Missing environment variables
  - Database connection failures
  - OpenAI API errors
  - Empty file uploads
  - Invalid file types
  - Empty questions
- **Verification**: Ensured proper HTTP status codes and user-friendly error messages

### 4. Chunking Logic
- **Review**: Verified word-safe splitting to avoid breaking words
- **Verification**: Checked overlap logic and edge cases (very short/long documents)
- **Testing**: Manually tested with sample documents

### 5. Database Schema
- **Review**: Verified relationships (Document → Chunk cascade delete)
- **Verification**: Confirmed indexes are appropriate for query patterns
- **Design**: Ensured embedding storage as Float[] matches requirements

## Model Selection

### Embedding Model: `text-embedding-3-small`
- **Reason**: Cost-effective for the project
- **Performance**: 1536 dimensions, good quality for semantic search
- **Tradeoff**: Lower cost vs. `text-embedding-3-large` (which has better quality but higher cost)

### Completion Model: `gpt-4o-mini`
- **Reason**: Balanced cost and performance
- **Performance**: Fast responses, good instruction following
- **Tradeoff**: Lower cost vs. `gpt-4o` (which has better reasoning but significantly higher cost)

## Known Limitations of LLM-Generated Code

1. **No Runtime Testing**: Generated code was not automatically tested - manual verification was required
2. **Edge Cases**: Some edge cases may not have been considered (e.g., very large embeddings, concurrent uploads)
3. **Performance**: No performance profiling was done - optimisations would be needed for production
4. **Security**: Basic validation implemented, but production would need more thorough security review
5. **Type Safety**: While TypeScript is used, runtime validation (e.g., Zod) would be beneficial for API routes

## Manual Improvements Made

1. **Chunking Overlap**: Added overlap logic to prevent context loss at chunk boundaries
2. **Similarity Threshold**: Added minimum similarity threshold (0.1) to filter out irrelevant results
3. **Error Messages**: Improved user-facing error messages for better UX
4. **Status Page**: Enhanced health checks to test actual API calls, not just configuration
5. **Type Definitions**: Added explicit interfaces for all API responses