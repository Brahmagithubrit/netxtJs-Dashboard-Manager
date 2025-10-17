import { connect_db } from "@/lib/db";
import task_model from "@/models/task_model";

export async function GET(req) {
  console.log("🔵 [GET] Request received");
  try {
    console.log("🟢 [GET] Connecting to MongoDB...");
    await connect_db();
    console.log("✅ [GET] MongoDB connected successfully");

    console.log("🟡 [GET] Fetching data from task_model...");
    const data = await task_model.find();
    console.log("✅ [GET] Data fetched:", data?.length, "records");

    console.log("🟣 [GET] Preparing response...");
    const response = new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ [GET] Response ready, sending to client");
    return response;
  } catch (err) {
    console.error("❌ [GET] Error occurred:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req) {
  console.log("🔵 [POST] Request received");
  try {
    console.log("🟢 [POST] Connecting to MongoDB...");
    await connect_db();
    console.log("✅ [POST] MongoDB connected successfully");

    console.log("🟡 [POST] Parsing request body...");
    const body = await req.json();
    console.log("✅ [POST] Parsed body:", body);

    const { id, task, completed, removed, edited } = body;
    if (
      id == null ||
      !task ||
      completed == null ||
      removed == null ||
      edited == null
    ) {
      console.warn("⚠️ [POST] Missing field in request:", body);
      return new Response(JSON.stringify({ error: "Missing any field" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("🟡 [POST] Creating new task in DB...");
    const newTask = await task_model.create(body);
    console.log("✅ [POST] Task created successfully:", newTask);

    const response = new Response(JSON.stringify(newTask), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
    console.log("✅ [POST] Response ready, sending to client");
    return response;
  } catch (err) {
    console.error("❌ [POST] Error occurred:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
