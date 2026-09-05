import { useEffect, useState } from 'react';
import api from '../services/api';
import TopNav from '../components/TopNav';
import { ChevronDown } from 'lucide-react';

export default function Tasks() {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/student/tasks')
      .then((response) => {
        if (active) setCourses(Array.isArray(response.data?.courses) ? response.data.courses : []);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Unable to load courses.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const topics = Array.isArray(selected?.topics) ? selected.topics : [];

  return (
    <>
      <TopNav />
      <main className="section tasks-page">
        <div className="section-title">
          <div><span className="eyebrow">COURSE TASKS</span><h1>{selected?.name || 'Learning paths'}</h1></div>
          {selected && <button className="secondary" onClick={() => { setSelected(null); setOpen(null); }}>← Back to Courses</button>}
        </div>

        {error && <div className="alert">{error}</div>}
        {loading && <div className="empty-state">Loading courses…</div>}

        {!loading && !selected && (
          courses.length ? (
            <div className="course-grid">
              {courses.map((course) => {
                const topicCount = Array.isArray(course?.topics) ? course.topics.length : 0;
                return (
                  <button className="course-card task-course" key={course._id} onClick={() => setSelected(course)}>
                    <div className="course-icon">{course.icon || '📚'}</div>
                    <h3>{course.name}</h3>
                    <p>{course.description || 'Practical developer training.'}</p>
                    <div><span>{topicCount} topics</span><span>5 questions/topic</span></div>
                  </button>
                );
              })}
            </div>
          ) : <div className="empty-state">No courses available.</div>
        )}

        {!loading && selected && (
          topics.length ? (
            <div className="topic-list">
              {topics.map((topic, index) => {
                const questions = Array.isArray(topic?.questions) ? topic.questions : [];
                return (
                  <div className="topic-item" key={topic?._id || topic?.title || index}>
                    <button className="topic-head" onClick={() => setOpen(open === index ? null : index)}>
                      <span><b>{String(index + 1).padStart(2, '0')}</b>{topic?.title || 'Topic'}<small>{topic?.summary || ''}</small></span>
                      <ChevronDown className={open === index ? 'rotate' : ''} />
                    </button>
                    {open === index && (
                      <div className="questions">
                        <span>{questions.length || 0} task questions</span>
                        {questions.length ? <ol>{questions.map((question, questionIndex) => <li key={question?._id || questionIndex}>{question?.question || question}</li>)}</ol> : <p>No questions added for this topic.</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : <div className="empty-state">No topics available for this course.</div>
        )}
      </main>
    </>
  );
}
