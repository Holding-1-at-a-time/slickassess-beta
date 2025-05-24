// Inside the function where JSON parsing happens
let parsedResponse
try {
  // Attempt to parse the JSON response
  parsedResponse = JSON.parse(aiResponse)
} catch (parseError) {
  console.error("Failed to parse AI response:", parseError)
  console.error("Raw AI response:", aiResponse)

  // Return a specific error about the parsing issue
  return; // NextResponse.json(
  // {
  //   error: 'Failed to parse AI analysis response',
  //   details: 'The AI returned malformed JSON',
  //   rawResponse: aiResponse.substring(0, 500) + '...' // Include part of the raw response for debugging
  // },
  // { status: 500 }
  // );
}
