import React, { useState, useEffect } from 'react';
import './GoalTracker.css';

const GoalTracker = () => {
  const [showModal, setShowModal] = useState(false);
  const [goal, setGoal] = useState({ title: '', description: '', dueDate: '', priority: 'Normal', subTasks: [] });
  const [goals, setGoals] = useState([]);

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = JSON.parse(localStorage.getItem('goals'));
    if (savedGoals) {
      setGoals(savedGoals);
    }
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGoal({ ...goal, [name]: value });
  };

  const handleAddGoal = () => {
    setGoals([...goals, { ...goal, id: Date.now(), completedSubTasks: 0 }]);
    setShowModal(false); // Close modal
    setGoal({ title: '', description: '', dueDate: '', priority: 'Normal', subTasks: [] });
  };

  const handleSubTaskChange = (index, goalId) => {
    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        g.subTasks[index].isComplete = !g.subTasks[index].isComplete;
        g.completedSubTasks = g.subTasks.filter(subTask => subTask.isComplete).length;
      }
      return g;
    });
    setGoals(updatedGoals);
  };

  const addSubTask = (goalId) => {
    const subTaskName = prompt("Enter sub-task name:");
    if (subTaskName) {
      setGoals(goals.map((g) => {
        if (g.id === goalId) {
          g.subTasks.push({ name: subTaskName, isComplete: false });
        }
        return g;
      }));
    }
  };

  const handleCompleteTask = (goalId) => {
    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        g.completedSubTasks = g.subTasks.length; // Mark all subtasks as complete
        g.subTasks.forEach(subTask => subTask.isComplete = true); // Mark each subtask as complete
      }
      return g;
    });
    setGoals(updatedGoals);
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId)); // Remove the goal with the specified id
  };

  const calculateProgress = (goal) => {
    return (goal.completedSubTasks / goal.subTasks.length) * 100 || 0;
  };

  const getGoalStatus = (goal) => {
    const today = new Date();
    const dueDate = new Date(goal.dueDate);

    if (dueDate < today) return 'overdue';
    const daysUntilDue = (dueDate - today) / (1000 * 60 * 60 * 24);

    if (daysUntilDue <= 3) return 'upcoming';
    return 'on-track';
  };

  return (
    <div className="goal-tracker">
      {/* Header */}
      <header className="header">
        <h1>Goal Tracker</h1>
        <button className="theme-toggle">🌙</button>
      </header>

      {/* Add Goal Button */}
      <button className="add-goal-btn" onClick={() => setShowModal(true)}>
        + Add Goal
      </button>

      {/* Goal Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Goal</h2>
            <input 
              type="text" 
              name="title" 
              placeholder="Goal Title" 
              value={goal.title} 
              onChange={handleInputChange} 
            />
            <textarea 
              name="description" 
              placeholder="Goal Description" 
              value={goal.description} 
              onChange={handleInputChange} 
            />
            <input 
              type="date" 
              name="dueDate" 
              value={goal.dueDate} 
              onChange={handleInputChange} 
            />
            <select name="priority" value={goal.priority} onChange={handleInputChange}>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Low">Low</option>
            </select>
            <button className="submit-btn" onClick={handleAddGoal}>Add Goal</button>
            <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Display Goals */}
      <div className="goal-list">
        {goals.map((goal) => (
          <div 
            key={goal.id} 
            className={`goal-card ${getGoalStatus(goal)}`} 
          >
            {/* Delete Button */}
            <button 
              className="delete-goal-btn" 
              onClick={() => handleDeleteGoal(goal.id)} 
              title="Delete Goal"
            >
              🗑️
            </button>
            
            <h3>{goal.title}</h3>
            <p>{goal.description}</p>
            <p>Due Date: {goal.dueDate}</p>
            <p>Priority: {goal.priority}</p>

            {/* Progress Bar */}
            <div className="progress-bar">
              <div className="progress" style={{ width: `${calculateProgress(goal)}%` }}></div>
            </div>
            <p>{calculateProgress(goal).toFixed(0)}% completed</p>

            {/* Sub-tasks */}
            <ul>
              {goal.subTasks.map((subTask, index) => (
                <li key={index}>
                  <input 
                    type="checkbox" 
                    checked={subTask.isComplete} 
                    onChange={() => handleSubTaskChange(index, goal.id)} 
                  />
                  {subTask.name}
                </li>
              ))}
            </ul>
            <button className="add-subtask-btn" onClick={() => addSubTask(goal.id)}>
              + Add Sub-task
            </button>

            {/* Complete Task Button */}
            {goal.subTasks.length === 0 && (
              <button className="complete-task-btn" onClick={() => handleCompleteTask(goal.id)}>
                Complete Task
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalTracker;

