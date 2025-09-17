import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "../config/firebase config/firebase.config";

// generate referral code
const generateReferralCode = (uid: string) => {
  return `ref-${uid.substring(0, 6)}`;
};

//save user data like uid, email, referral code, referral link, credits, createdAt
const saveUserWithReferral = async (uid: string, email: string) => {
  const referralCode = generateReferralCode(uid);
  const referredBy = localStorage.getItem("referralCode");
  const referralLink = `${window.location.origin}/invite?code=${referralCode}`;

  await setDoc(doc(firestore, "users", uid), {
    uid, // their own code
    email,
    referralCode,
    referralLink,
    credits: 100,
    referredBy: referredBy || null, // from localStorage
    referredTo: [],
    successfulReferrals: [],
    referralRewards: {
      sharedLinkCount: 0,
      signedUpFromReferrals: 0,
    },
    createdAt: new Date(),
  });

  if (referredBy) {
    const inviterSnap = await getDocs(
      query(
        collection(firestore, "users"),
        where("referralCode", "==", referredBy)
      )
    );

    if (!inviterSnap.empty) {
      const inviterDoc = inviterSnap.docs[0];
      const inviterId = inviterDoc.id;
      const inviterData = inviterDoc.data();

      // ✅ Instead of checking sentTo, check if they've already signed up (referredTo)
      const alreadyReferred = inviterData.successfulReferrals?.includes(email);

      if (!alreadyReferred) {
        const newCredits = inviterData.credits + 50;

        await updateDoc(doc(firestore, "users", inviterId), {
          credits: newCredits,
          successfulReferrals: arrayUnion(email), // 🆕 track signups
          "referralRewards.signedUpFromReferrals":
            (inviterData.referralRewards?.signedUpFromReferrals || 0) + 1,
        });

        // ✅ Clean up referralCode
        // localStorage.removeItem("referralCode");
      }
    }
  }

  return referralLink;
};

export default saveUserWithReferral;
