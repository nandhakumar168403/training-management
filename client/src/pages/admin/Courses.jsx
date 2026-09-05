import { useEffect, useState } from 'react';
import api from '../../services/api';

const blank = { name: '', slug: '', description: '', icon: '📚', topics: [] };
const newTopic = () => ({
  title: '',
  summary: '',
  questions: [{ question: '' }, { question: '' }, { question: '' }, { question: '' }, { question: '' }],
});

const normalizeCourse = (course = {}) => ({
  name: course.name || '',
  slug: course.slug || '',
  description: course.description || '',
  icon: course.icon || '📚',
  topics: Array.isArray(course.topics)
    ? course.topics.map((topic) => ({
        title: topic?.title || '',
        summary: topic?.summary || '',
        questions: Array.isArray(topic?.questions)
          ? [0, 1, 2, 3, 4].map((index) => ({ question: topic.questions[index]?.question || '' }))
          : newTopic().questions,
      }))
    : [],
});

export default function Courses() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(0);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const response = await api.get('/admin/courses');
      setItems(Array.isArray(response.data?.courses) ? response.data.courses : []);
    } catch (err) {
      console.error('Courses loading failed:', err);
      setItems([]);
      setError(err.response?.data?.message || 'Unable to load courses.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this course and all its topics/questions?')) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete course.');
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setError('');

    const topics = (Array.isArray(form.topics) ? form.topics : []).map((item) => ({
      title: item.title.trim(),
      summary: item.summary?.trim() || '',
      questions: [0, 1, 2, 3, 4].map((index) => ({
        question: item.questions?.[index]?.question?.trim() || '',
      })),
    }));

    if (!topics.length) {
      setError('Add at least one topic.');
      return;
    }

    if (topics.some((item) => !item.title || item.questions.some((q) => !q.question))) {
      setError('Every topic must have a title and exactly 5 questions.');
      return;
    }

    const data = {
      ...form,
      name: form.name.trim(),
      slug: form.slug?.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      topics,
    };

    try {
      if (editing) await api.put(`/admin/courses/${editing._id}`, data);
      else await api.post('/admin/courses', data);
      setOpen(false);
      setEditing(null);
      setForm(blank);
      setTopic(0);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save course.');
    }
  };

  const updateTopic = (index, key, value) => {
    setForm((current) => ({
      ...current,
      topics: (Array.isArray(current.topics) ? current.topics : []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const updateQuestion = (topicIndex, questionIndex, value) => {
    setForm((current) => ({
      ...current,
      topics: (Array.isArray(current.topics) ? current.topics : []).map((item, itemIndex) => {
        if (itemIndex !== topicIndex) return item;
        const questions = Array.isArray(item.questions) ? [...item.questions] : newTopic().questions;
        questions[questionIndex] = { question: value };
        return { ...item, questions };
      }),
    }));
  };

  const startCreate = () => {
    setError('');
    setEditing(null);
    setForm({ ...blank, topics: [newTopic()] });
    setTopic(0);
    setOpen(true);
  };

  const startEdit = (course) => {
    setError('');
    setEditing(course);
    setForm(normalizeCourse(course));
    setTopic(0);
    setOpen(true);
  };

  const topics = Array.isArray(form.topics) ? form.topics : [];

  return (
    <div>
      <div className="content-heading">
        <div>
          <span className="eyebrow">MODULE 4</span>
          <h1>Courses & Tasks</h1>
          <p>Manage Java, Python and MERN courses with exactly five question-only tasks per topic.</p>
        </div>
        <button className="primary compact" onClick={startCreate}>+ Add Course</button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="course-admin-grid">
        {items.map((course) => {
          const topicCount = Array.isArray(course.topics) ? course.topics.length : 0;
          return (
            <div className="panel course-admin" key={course._id}>
              <div className="course-icon">{course.icon || '📚'}</div>
              <div>
                <h3>{course.name}</h3>
                <p>{course.description}</p>
                <b>{topicCount} topics · {topicCount * 5} questions</b>
              </div>
              <div className="actions">
                <button onClick={() => startEdit(course)}>Edit</button>
                <button className="danger" onClick={() => remove(course._id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <div className="modal-backdrop">
          <div className="modal wide-modal">
            <button className="modal-close" onClick={() => setOpen(false)}>×</button>
            <h2>{editing ? 'Update' : 'Create'} Course</h2>

            <form onSubmit={save}>
              <div className="form-grid">
                <label>
                  Course Name
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                </label>
                <label>
                  Icon
                  <input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} />
                </label>
                <label className="form-full">
                  Description
                  <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                </label>
              </div>

              <div className="editor-toolbar">
                <h3>Topics & 5 Questions</h3>
                <button
                  type="button"
                  onClick={() => {
                    setForm((current) => ({ ...current, topics: [...topics, newTopic()] }));
                    setTopic(topics.length);
                  }}
                >
                  + Topic
                </button>
              </div>

              <div className="topic-editor">
                {topics.map((item, index) => (
                  <div className={`topic-edit ${topic === index ? 'selected' : ''}`} key={index}>
                    <button type="button" className="topic-select" onClick={() => setTopic(index)}>
                      <b>{index + 1}. {item.title || 'New Topic'}</b>
                      <span>5 questions</span>
                    </button>

                    {topic === index && (
                      <div className="topic-fields">
                        <input
                          placeholder="Topic title"
                          value={item.title}
                          onChange={(event) => updateTopic(index, 'title', event.target.value)}
                          required
                        />
                        <input
                          placeholder="One-line topic summary"
                          value={item.summary}
                          onChange={(event) => updateTopic(index, 'summary', event.target.value)}
                        />
                        {[0, 1, 2, 3, 4].map((questionIndex) => (
                          <input
                            key={questionIndex}
                            placeholder={`Question ${questionIndex + 1}`}
                            value={item.questions?.[questionIndex]?.question || ''}
                            onChange={(event) => updateQuestion(index, questionIndex, event.target.value)}
                            required
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button className="primary form-full">Save Course</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
