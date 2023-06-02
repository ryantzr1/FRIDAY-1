import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from 'axios';

const Database = () => {
  const { getUid } = useAuth();
  const [selectedOption, setSelectedOption] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const products = [];

  if (getUid() === "lZLIC6fK2WQOvIxyXKECEjx625w1" || getUid() === "Hoz3NtloWXX7MciVcTn8BNAHIJs1") {
    products.push("A500S", "A800S");
  }

  useEffect(() => {
    async function fetchText() {
      if (selectedOption) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `https://friday-backend-server-new.herokuapp.com/retrieve?product=${selectedOption}`
          );
          const data = await response.text();
          const text = JSON.parse(data).data.join("\n\n");
          setText(text);
        } catch (error) {
          setText("");
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setText("");
      }
    }
    fetchText();
  }, [selectedOption]);

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSaveClick = async () => {
    try {
      setSaving(true);

      const response = await axios.post("https://friday-backend-server-new.herokuapp.com/update", {
        childName: selectedOption,
        items: text
      });

      if (response.data && response.data.message === "Update successful") {
        alert("Text saved successfully!");
      } else {
        alert("Failed to save text.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save text.");
    } finally {
      setSaving(false);
    }
  };

  const isSaveDisabled = !selectedOption || saving;

  return (
    <main className="pt-8 px-4 sm:px-6 lg:px-8">
      <div className="container h-screen mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-green-900">Database</h1>
        <div className="flex mb-4">
          <select
            id="product-dropdown"
            className="w-full p-2 border border-gray-300 rounded"
            onChange={handleSelectChange}
            value={selectedOption}
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            {selectedOption ? (
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold">Edit Product Information:</span>
              </div>
            ) : null}
            <textarea
              className="w-full h-4/6 p-2 border border-gray-300 rounded"
              value={text}
              onChange={handleTextChange}
              disabled={!selectedOption}
            />
          </>
        )}
        <div className="flex justify-center mt-4">
          <button
            className={`px-4 py-2 rounded-lg text-white ${isSaveDisabled ? "bg-gray-500 cursor-default" : "bg-green-500 hover:bg-green-600"}`}
            onClick={handleSaveClick}
            disabled={isSaveDisabled}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Database;

// import { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import axios from 'axios';

// const Database = () => {
//   const { getUid } = useAuth();
//   const [selectedOption, setSelectedOption] = useState("");
//   const [selectedItem, setSelectedItem] = useState("");
//   const [items, setItems] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const products = [];

//   if (getUid() === "lZLIC6fK2WQOvIxyXKECEjx625w1" || getUid() === "Hoz3NtloWXX7MciVcTn8BNAHIJs1") {
//     products.push("A500S", "A800S");
//   }

//   useEffect(() => {
//     async function fetchItems() {
//       if (selectedOption) {
//         try {
//           setIsLoading(true);
//           const response = await fetch(
//             `https://friday-backend-server-new.herokuapp.com/retrieve?product=${selectedOption}`
//           );
//           const data = await response.json();
//           setItems(data.data);
//         } catch (error) {
//           setItems([]);
//           console.error(error);
//         } finally {
//           setIsLoading(false);
//         }
//       } else {
//         setItems([]);
//       }
//     }
//     fetchItems();
//   }, [selectedOption]);

//   const handleSelectChange = (e) => {
//     setSelectedOption(e.target.value);
//     setSelectedItem("");
//   };

//   const handleSelectItemChange = (e) => {
//     setSelectedItem(e.target.value);
//   };

//   const handleSaveClick = async () => {
//     try {
//       setSaving(true);

//       const response = await axios.post("https://friday-backend-server-new.herokuapp.com/update", {
//         childName: selectedOption,
//         items: items.join("\n\n")
//       });

//       if (response.data && response.data.message === "Update successful") {
//         alert("Text saved successfully!");
//       } else {
//         alert("Failed to save text.");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Failed to save text.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const isSaveDisabled = !selectedOption || saving;

//   return (
//     <main className="pt-8 px-4 sm:px-6 lg:px-8">
//       <div className="container h-screen mx-auto">
//         <h1 className="text-3xl font-bold mb-4">Database</h1>
//         <div className="flex mb-4">
//           <select
//             id="product-dropdown"
//             className="w-full p-2 border border-gray-300 rounded"
//             onChange={handleSelectChange}
//             value={selectedOption}
//           >
//             <option value="">Select Product</option>
//             {products.map((product) => (
//               <option key={product} value={product}>{product}</option>
//             ))}
//           </select>
//         </div>
//         {isLoading ? (
//           <div className="flex items-center justify-center">
//             <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//           </div>
//         ) : (
//           <>
//             {selectedOption ? (
//               <>
//                 <div className="flex items-center justify-between mb-4">
//                   <span className="font-bold">Selected Product:</span>
//                   <span>{selectedOption}</span>
//                 </div>
//                 {items.length > 0 ? (
//                   <div className="flex mb-4">
//                     <select
//                       id="item-dropdown"
//                       className="w-full p-2 border border-gray-300 rounded"
//                       onChange={handleSelectItemChange}
//                       value={selectedItem}
//                     >
//                       <option value="">Select Item</option>
//                       {items.map((item) => (
//                         <option key={item} value={item}>{item}</option>
//                       ))}
//                     </select>
//                   </div>
//                 ) : null}
//                 <textarea
//                   className="w-full h-4/6 p-2 border border-gray-300 rounded"
//                   value={selectedItem ? items[items.indexOf(selectedItem)] : ""}
//                   onChange={(e) => setSelectedItem(e.target.value)}
//                   disabled={!selectedItem}
//                 />
//               </>
//             ) : null}
//           </>
//         )}
//         <div className="flex justify-center mt-4">
//           <button
//             className={`px-4 py-2 rounded-lg text-white ${isSaveDisabled ? "bg-gray-500 cursor-default" : "bg-green-500 hover:bg-green-600"}`}
//             onClick={handleSaveClick}
//             disabled={isSaveDisabled}
//           >
//             {saving ? "Saving..." : "Save"}
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// };

// export default Database;