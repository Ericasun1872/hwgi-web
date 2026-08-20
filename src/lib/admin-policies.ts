import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import {
  DEFAULT_POLICIES,
  POLICY_DOC_ID,
  type ChapterPolicies,
} from "@/lib/policies";

function mapPolicies(data: Record<string, unknown> | undefined): ChapterPolicies {
  if (!data) return { ...DEFAULT_POLICIES };
  return {
    termsTitle: String(data.termsTitle ?? DEFAULT_POLICIES.termsTitle),
    termsBody: String(data.termsBody ?? DEFAULT_POLICIES.termsBody),
    privacyTitle: String(data.privacyTitle ?? DEFAULT_POLICIES.privacyTitle),
    privacyBody: String(data.privacyBody ?? DEFAULT_POLICIES.privacyBody),
    bylawsTitle: String(data.bylawsTitle ?? DEFAULT_POLICIES.bylawsTitle),
    bylawsBody: String(data.bylawsBody ?? DEFAULT_POLICIES.bylawsBody),
  };
}

export async function getChapterPolicies(): Promise<ChapterPolicies> {
  try {
    const snap = await getDoc(doc(getDb(), "chapter_policies", POLICY_DOC_ID));
    if (!snap.exists()) return { ...DEFAULT_POLICIES };
    return mapPolicies(snap.data());
  } catch {
    return { ...DEFAULT_POLICIES };
  }
}

export async function getChapterPoliciesClient(): Promise<ChapterPolicies> {
  return getChapterPolicies();
}

export async function saveChapterPolicies(
  policies: ChapterPolicies,
): Promise<void> {
  await setDoc(
    doc(getDb(), "chapter_policies", POLICY_DOC_ID),
    {
      ...policies,
      termsTitle: policies.termsTitle.trim(),
      termsBody: policies.termsBody.trim(),
      privacyTitle: policies.privacyTitle.trim(),
      privacyBody: policies.privacyBody.trim(),
      bylawsTitle: policies.bylawsTitle.trim(),
      bylawsBody: policies.bylawsBody.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
