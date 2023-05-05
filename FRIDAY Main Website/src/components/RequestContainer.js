function RequestContainer({ log }) {
    const { question, answer, success } = log;
    const successColor = success ? "text-green-500" : "text-red-500";

    return (
        <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between mb-4">
        <div>
            <div className="font-bold">Question: {question}</div>
            <div className="font-bold">Answer: <span className={`text-sm ${successColor}`}>{answer}</span></div>
        </div>
        <div className={`bg-gray-200 rounded-full px-2 py-1 ${successColor}`}>
            {success ? "Answered" : "Unanswered"}
        </div>
        </div>
    );
}

export default RequestContainer;