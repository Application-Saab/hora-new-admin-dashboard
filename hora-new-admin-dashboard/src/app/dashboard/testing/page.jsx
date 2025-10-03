"use client";
import { useEffect } from 'react';
import { useProjectStore } from '../testing/useProjectStore';
import Editor from '../testing/Editor';

function App() {
  const initFromTemplate = useProjectStore(state => state.initFromTemplate);

  useEffect(() => {
    initFromTemplate('birthday');
  }, [initFromTemplate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Photo Book Editor</h1>
      <Editor />
    </div>
  );
}

export default App;