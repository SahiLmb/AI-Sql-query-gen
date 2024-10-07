// TemplateQuestions.jsx
import React from 'react';

const TemplateQuestions = ({ onTemplateClick }) => {
    // List of template questions
    const templates = [
        "What is the summary of this PDF?",
        "What are the key points discussed?",
        "Can you list the main arguments?",
        "Provide a detailed overview."
    ];

    return (
        <div className="grid grid-cols-2 gap-4 mb-4">
            {templates.map((question, index) => (
                <button
                    key={index}
                    onClick={() => onTemplateClick(question)}
                    className="bg-gray-900 p-4 rounded-lg shadow hover:bg-gray-600 transition-colors"
                >
                    {question}
                </button>
            ))}
        </div>
    );
};

export default TemplateQuestions;
