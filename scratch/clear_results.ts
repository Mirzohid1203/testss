import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./src/lib/firebase";

async function clearAllResults() {
    console.log("Cleaning up results...");
    try {
        const querySnapshot = await getDocs(collection(db, "results"));
        const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, "results", d.id)));
        await Promise.all(deletePromises);
        console.log(`Successfully deleted ${querySnapshot.size} results.`);
    } catch (error) {
        console.error("Error clearing results:", error);
    }
}

clearAllResults();
