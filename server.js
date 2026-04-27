const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.Mongo_Url)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

const questionSchema = new mongoose.Schema({
    ownership: String,
    slacked: String
}, { timestamps: true });

const Question = mongoose.model("Question", questionSchema);

const gameSchema = new mongoose.Schema({
    intrusiveThoughts: String
}, { timestamps: true });

const Game = mongoose.model("Game", gameSchema);

const votingQuestions = [
    { id: "q1", text: "Who is the best actor (pretends to work the most)😄 ?" },
    { id: "q2", text: "Who says “I’m busy” but is actually free😄 ?" },
    { id: "q3", text: "Who is the master of doing minimum work😄 ?" },
    { id: "q4", text: "Who gives the longest/useless explanations😄 ?" },
    { id: "q5", text: "Who will say “let’s connect later” and never does😄 ?" },
    { id: "q6", text: "Who is always confused but nods anyway😄 ?" },
    { id: "q7", text: "Who is the king/queen of excuses😄 ?" },
    { id: "q8", text: "Who is most likely to disappear during work hours😄 ?" },
    { id: "q9", text: "Who always looks sick in office😄 ?" },
    { id: "q10", text: "Who vanishes from office exactly at 6:29😄 ?" },
];

const votingOptions = [
    { id: "o1", name: "Rakshit" }, { id: "o2", name: "Basavaprabhu" }, { id: "o3", name: "Anto" },
    { id: "o4", name: "Smitha" }, { id: "o5", name: "Sibila" }, { id: "o6", name: "Nazia" },
    { id: "o7", name: "Umesh" }, { id: "o8", name: "Sheela" }, { id: "o9", name: "Rakesh" },
    { id: "o10", name: "Safina" }, { id: "o11", name: "Maheen" }, { id: "o12", name: "Mitali" },
    { id: "o13", name: "Murali" }, { id: "o14", name: "Rubina" }, { id: "o15", name: "Salma" },
    { id: "o16", name: "Anuja" }, { id: "o17", name: "Yuvaraj" }, { id: "o18", name: "Annapoornima" },
    { id: "o19", name: "Netra" }, { id: "o20", name: "Manasa" }, { id: "o21", name: "Chandana" },
    { id: "o22", name: "Kishore" }, { id: "o23", name: "Sharan" }, { id: "o24", name: "Jeevan" },
    { id: "o25", name: "Shashikala" }, { id: "o26", name: "Naveen" }, { id: "o27", name: "Abhishek" },
    { id: "o28", name: "Pradeep" }, { id: "o29", name: "Antony" }, { id: "o30", name: "RamKrishna" },
    { id: "o31", name: "Nitin" }, { id: "o32", name: "Ramachandra" }, { id: "o33", name: "Prasanna" }
];

const voteSchema = new mongoose.Schema({
    questionId: String,
    optionId: String
});

const Vote = mongoose.model("Vote", voteSchema);

app.post("/api/questions", async (req, res) => {
    try {
        const { ownership, slacked } = req.body;
        const newQuestion = new Question({ ownership, slacked });
        await newQuestion.save();
        res.status(201).json({ message: "Questions submitted successfully", data: newQuestion });
    } catch (error) {
        res.status(500).json({ error: "Failed to submit questions" });
    }
});

app.post("/api/game", async (req, res) => {
    try {
        const { intrusiveThoughts } = req.body;
        const newGame = new Game({ intrusiveThoughts });
        await newGame.save();
        res.status(201).json({ message: "Game submitted successfully", data: newGame });
    } catch (error) {
        res.status(500).json({ error: "Failed to submit game" });
    }
});

app.get("/api/questions", async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch questions" });
    }
});

app.get("/api/game", async (req, res) => {
    try {
        const games = await Game.find().sort({ createdAt: -1 });
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch games" });
    }
});

app.get("/api/voting/config", (req, res) => {
    res.json({ questions: votingQuestions, options: votingOptions });
});

app.post("/api/voting/vote", async (req, res) => {
    try {
        const { questionId, optionId } = req.body;
        const newVote = new Vote({ questionId, optionId });
        await newVote.save();
        res.status(201).json({ message: "Vote recorded" });
    } catch (error) {
        res.status(500).json({ error: "Failed to submit vote" });
    }
});

app.get("/api/voting/results", async (req, res) => {
    try {
        const results = await Vote.aggregate([
            { $group: { _id: { questionId: "$questionId", optionId: "$optionId" }, count: { $sum: 1 } } },
            { $group: { _id: "$_id.questionId", votes: { $push: { optionId: "$_id.optionId", count: "$count" } } } }
        ]);
        res.status(200).json({ results, questions: votingQuestions, options: votingOptions });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch results" });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});