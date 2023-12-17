import React, { useState, useEffect } from 'react';
import Preview from './components/Preview';
import Message from './components/Message';
import NotesContainer from "./components/Notes/NotesContainer";
import NotesList from "./components/Notes/NotesList";
import Note from "./components/Notes/Note";
import NoteForm from "./components/Notes/NoteForm";
import Alert from './components/Alert';
import './App.css';

function App() {

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);


  useEffect(() => {
    if (localStorage.getItem('notes')) {
      setNotes(JSON.parse(localStorage.getItem('notes')));
    } else {
      localStorage.setItem('notes', JSON.stringify([]));
    }
  }, [])

  useEffect(() => {
    if (validationErrors.length !== 0) {
      setTimeout(() => {
        setValidationErrors([]);
      }, 3000)
    }
  }, [validationErrors])

  const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const validate = () => {
    const validationErrors = [];
    let passed = true;
    if (!title) {
      validationErrors.push("الرجاء إدخال عنوان الملاحظة");
      passed = false;
    }

    if (!content) {
      validationErrors.push("الرجاء إدخال محتوى الملاحظة");
      passed = false;
    }

    setValidationErrors(validationErrors);
    return passed;
  }

  // Changing title
  const changeTitleHandler = (event) => {
     setTitle(event.target.value);
  };

  // Changing content
  const changeContentHandler = (event) => {
    setContent(event.target.value);
  };

  // Saving Note
  const saveNoteHandler = () => {

    if (!validate()) return;

    const note = {
      id: new Date(),
      title: title,
      content: content,
    };

    const updatedNotes = [...notes, note];

    saveToLocalStorage('notes', updatedNotes);
    setNotes(updatedNotes);
    setCreating(false);
    setSelectedNote(note.id);
    setTitle("");
    setContent("");
  };

  const selectNoteHandler = noteId => {
    setSelectedNote(noteId);
    setCreating(false);
    setEditing(false);
  }

  // Edit Note
  const editNoteHandler = () => {
    const note = notes.find(note => note.id === selectedNote);
    setEditing(true);
    setTitle(note.title);
    setContent(note.content);
  }

  // Update Note
  const updateNoteHandler = () => {

    if (!validate()) return;

    const updatedNotes = [...notes ];
    const noteIndex = notes.findIndex(note => note.id === selectedNote);
    updatedNotes[noteIndex] = {
      id: selectedNote,
      title: title,
      content: content,
    };
    saveToLocalStorage('notes', updatedNotes);
    setNotes(updatedNotes);
    setEditing(false);
    setTitle('');
    setContent('');
  }

  // Swich to add note
  const addNoteHandler = () => {
    setCreating(true);
    setEditing(false);
    setTitle('');
    setContent('');
  }

  // Delete Note
  const deleteNoteHandler = () => {
    const updatedNotes = [...notes];
    const noteIndex = updatedNotes.findIndex(note => note.id === selectedNote);
    notes.splice(noteIndex, 1);
    saveToLocalStorage('notes', notes);
    setNotes(notes);
    setSelectedNote(null);
  }

  const getAddNote = () => {
    return (
      <NoteForm 
        formTitle="ملاحظة جديدة"
        title={title}
        content={content}
        titleChanged={changeTitleHandler}
        contentChanged={changeContentHandler}
        submitText="حفظ"
        submitClicked={saveNoteHandler}
      />
    );
  };

  const getPreview = () => {
    if(notes.length === 0) return <Message title="لا يوجد أية ملاحظة"/>

    if(!selectedNote) return <Message title="الرجاء إختيار ملاحظة" />

    const note = notes.find(note => {
      return note.id === selectedNote;
    })

    let noteDisplay = (
      <div>
        <h1>{note.title}</h1>
        <p>{note.content}</p>
      </div>
    )

    if(editing) {
      noteDisplay = (
      <NoteForm 
        formTitle="تعديل ملاحظة"
        title={title}
        content={content}
        titleChanged={changeTitleHandler}
        contentChanged={changeContentHandler}
        submitText="تعديل"
        submitClicked={updateNoteHandler}
      />
      )
    }
    return (
      <div>
        {!editing && 
          <div className="note-operations">
            <a href="#" onClick={editNoteHandler}>
              <i className="fa fa-pencil-alt" />
            </a>
            <a href="#">
              <i className="fa fa-trash" onClick={deleteNoteHandler} />
            </a>
          </div>
        }
        {noteDisplay}
      </div>
    );
  };

  return (
    <div className="App">
      <NotesContainer className="notes-section">
        <NotesList className="notes-list">

          {notes.map(note => 
          <Note 
            key={note.id} 
            title={note.title} 
            noteClicked={() => selectNoteHandler(note.id)} 
            active={selectedNote === note.id}
          />
          )}

        </NotesList>
        <button className="add-btn" onClick={addNoteHandler}>+</button>
      </NotesContainer>
      <Preview>
        {creating ? getAddNote(): getPreview()}
      </Preview>

      {validationErrors.length !== 0 && <Alert validationMessages={validationErrors} />}
    </div>
  );
}

export default App;
