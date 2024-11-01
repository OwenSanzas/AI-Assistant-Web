// EmailPreview.js
import React from 'react';

const EmailPreview = ({ emailData, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full m-4">
        <h2 className="text-2xl font-bold mb-4">Email Preview</h2>
        
        <div className="mb-4">
          <div className="mb-2">
            <span className="font-semibold">From:</span> {emailData.sender}
          </div>
          <div className="mb-2">
            <span className="font-semibold">To:</span> {emailData.recipient}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Subject:</span> {emailData.subject}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Content:</span>
            <div className="mt-2 whitespace-pre-wrap border p-3 rounded">
              {emailData.content}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;