const express = require('express');
const router = express.Router();
const Notes = require("../models/Notes");
const fetchUser = require('../middleware/fetchUser')
const { body, validationResult } = require('express-validator');

// ROUTE 01: Get all the notes using: GET '/api/notes/getallnotes'    
router.get('/getallnotes', fetchUser, async (req, res) => {
    try {
        // Get all the notes
        const notes = await Notes.find({ user: req.user.id });
        res.json({ status: true, totalNotes: notes.length, notes: notes })

    } catch (error) {
        res.status(500).json({ status: false, msg: "Internal Server Error" })
    }
});

// ROUTE 02: Create a note using: POST '/api/notes/addnote'    
router.post('/addnote', fetchUser, [
    // Validate the request body
    body('title').isString().withMessage('Title must be a string').isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),

    body('description').isString().withMessage('Content must be a string').isLength({ min: 5 }).withMessage('Content must be at least 3 characters long'),

], async (req, res) => {
    try {
        // Get the validation result
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Create a new note
        const newNote = new Notes({
            user: req.user.id,
            title: req.body.title,
            description: req.body.description,
            tag: req.body.tag,
        });

        // Save the note
        const note = await newNote.save();
        res.json({ status: true, note })

    } catch (error) {
        res.status(500).json({ status: false, msg: "Internal Server Error" })
    }
});

// ROUTE 03: Update a note using: PUT '/api/notes/updatenote'
router.put('/updatenote/:id', fetchUser, async (req, res) => {
    try 
    {
        // Get the title, description and tag from the request body
        const { title, description, tag } = req.body;

        // create a new note
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if(!note){
            return res.status(404).json({ status: false, msg: "Note not found" })
        }

        // Check if the note belongs to the user
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ status: false, msg: "Not Allowed" })
        }

        // Update the note
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ status: true, note })

    } catch (error) {
        res.status(500).json({ status: false, msg: "Internal Server Error" })
    }
});

// ROUTE 04: Delete a note using: DELETE '/api/notes/deletenote'
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    try {
        // Find the note to be deleted and delete it
        let note = await Notes.findById(req.params.id);
        if(!note){
            return res.status(404).json({ status: false, msg: "Note not found" })
        }

        // Check if the note belongs to the user
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ status: false, msg: "Not Allowed" })
        }

        // Delete the note
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ status: true, msg: "Note has been deleted", note })

    } catch (error) {
        res.status(500).json({ status: false, msg: "Internal Server Error" })
    }
});

module.exports = router;