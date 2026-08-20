"use client";

import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { authorKeyFromEmail, memberDisplayName, type ChapterMember } from "@/lib/member";
import type { BoardKind } from "@/lib/types";

export async function createBoardPost(input: {
  kind: BoardKind;
  member: ChapterMember;
  authorName: string;
  title: string;
  body: string;
  imageBytesBase64?: string | null;
  hasBakedText?: boolean;
}): Promise<string> {
  const email = input.member.email.trim().toLowerCase();
  const id = `${input.kind}_web_${Date.now()}`;
  const data: Record<string, unknown> = {
    id,
    kind: input.kind,
    boardType: input.kind,
    authorEmail: email,
    authorKey: authorKeyFromEmail(email),
    authorName: input.authorName.trim() || memberDisplayName(input.member),
    title: input.title.trim(),
    body: input.body.trim(),
    imageAsset: null,
    hasBakedText: Boolean(input.hasBakedText),
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };
  if (input.imageBytesBase64) {
    data.imageBytesBase64 = input.imageBytesBase64;
  }
  await setDoc(doc(getDb(), "board_posts", id), data, { merge: true });
  return id;
}

export async function updateBoardPost(input: {
  id: string;
  kind: BoardKind;
  member: ChapterMember;
  title: string;
  body: string;
  imageBytesBase64?: string | null;
  clearImage?: boolean;
  hasBakedText?: boolean;
  authorName: string;
  authorEmail?: string | null;
  authorKey: string;
}): Promise<void> {
  const email = input.member.email.trim().toLowerCase();
  const postEmail = (input.authorEmail ?? "").trim().toLowerCase();
  const myKey = authorKeyFromEmail(email);
  const isOwn =
    input.authorKey === myKey || (!!postEmail && postEmail === email);
  if (!isOwn) {
    throw new Error("본인이 작성한 글만 수정할 수 있습니다.");
  }
  const data: Record<string, unknown> = {
    id: input.id,
    kind: input.kind,
    boardType: input.kind,
    authorEmail: input.authorEmail ?? email,
    authorKey: input.authorKey,
    authorName: input.authorName,
    title: input.title.trim(),
    body: input.body.trim(),
    hasBakedText: Boolean(input.hasBakedText),
    updatedAt: serverTimestamp(),
  };
  if (input.clearImage) {
    data.imageBytesBase64 = null;
    data.imageAsset = null;
  } else if (input.imageBytesBase64) {
    data.imageBytesBase64 = input.imageBytesBase64;
  }
  await setDoc(doc(getDb(), "board_posts", input.id), data, { merge: true });
}

export async function createBoardComment(input: {
  postId: string;
  kind: BoardKind;
  member: ChapterMember;
  body: string;
}): Promise<string> {
  const email = input.member.email.trim().toLowerCase();
  const id = `comment_web_${Date.now()}`;
  const now = new Date();
  await setDoc(doc(collection(getDb(), "board_comments"), id), {
    id,
    postId: input.postId,
    authorKey: authorKeyFromEmail(email),
    authorName: memberDisplayName(input.member),
    authorEmail: email,
    body: input.body.trim(),
    createdAtLabel: "방금",
    createdAt: Timestamp.fromDate(now),
    kind: input.kind,
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updateBoardComment(input: {
  comment: {
    id: string;
    postId: string;
    authorKey: string;
    authorName: string;
    authorEmail?: string | null;
    createdAtLabel?: string;
    createdAt?: string | null;
  };
  kind: BoardKind;
  body: string;
  memberEmail: string;
}): Promise<void> {
  const email = input.memberEmail.trim().toLowerCase();
  const createdAt = input.comment.createdAt
    ? Timestamp.fromDate(new Date(input.comment.createdAt))
    : Timestamp.now();
  await setDoc(doc(getDb(), "board_comments", input.comment.id), {
    id: input.comment.id,
    postId: input.comment.postId,
    authorKey: input.comment.authorKey,
    authorName: input.comment.authorName,
    authorEmail: (input.comment.authorEmail ?? email).trim().toLowerCase(),
    body: input.body.trim(),
    createdAtLabel: input.comment.createdAtLabel ?? "",
    createdAt,
    kind: input.kind,
    updatedAt: serverTimestamp(),
  });
}

/** 운영진 또는 작성자: 댓글 삭제 */
export async function deleteBoardComment(commentId: string): Promise<void> {
  await deleteDoc(doc(getDb(), "board_comments", commentId));
}

/** 운영진(또는 작성자·Firestore 규칙): 게시글 삭제 */
export async function deleteBoardPost(postId: string): Promise<void> {
  await deleteDoc(doc(getDb(), "board_posts", postId));
}

/** Compress image to JPEG base64, target under ~400KB. */
export async function fileToOptimizedBase64(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 처리할 수 없습니다.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let quality = 0.85;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > 550_000 && quality > 0.45) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("이미지 변환에 실패했습니다.");
  return base64;
}
