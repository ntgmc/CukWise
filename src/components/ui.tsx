import Link from "./link";
import {ArrowUpRight,ArrowRight,BookOpen} from "lucide-react";
import type {ReactNode} from "react";
import type {Reading} from "@/lib/domain";
import {dateLabel,readingKinds,type PublicReview} from "@/lib/domain";
import type {Guide} from "@/data/guides";

export function PageHeading({title,description,children}:{title:string;description:string;children?:ReactNode}) {return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{children}</div>;}
export function SectionHeading({title,description,href,label="查看全部"}:{title:string;description?:string;href?:string;label?:string}) {return <div className="section-heading"><div><h2>{title}</h2>{description&&<p>{description}</p>}</div>{href&&<Link className="text-link" href={href}>{label}<ArrowRight size={16}/></Link>}</div>;}
export function EmptyState({title,description,href,label}:{title:string;description:string;href?:string;label?:string}) {return <div className="empty-state"><BookOpen size={26}/><h3>{title}</h3><p>{description}</p>{href&&<Link href={href} className="button">{label??"去看看"}<ArrowUpRight size={15}/></Link>}</div>;}
export function ReadingCard({reading}:{reading:Reading}) {return <a className="reading-card" href={reading.url} target="_blank" rel="noreferrer"><div className="reading-meta"><span className="badge">{readingKinds[reading.kind]}</span><span>{reading.author}</span><span>{dateLabel(reading.date)}</span></div><h3>{reading.title}<ArrowUpRight size={19}/></h3><p>{reading.description}</p><span className="text-link">{reading.kind==="video"?"查看视频入口":"阅读原文"} <ArrowRight size={15}/></span></a>;}
export function GuideCard({guide}:{guide:Guide}) {return <Link className="reading-card guide-card" href={`/guides/${guide.id}`}><div className="reading-meta"><BookOpen size={16}/><span>站内选购指南</span><span>{dateLabel(guide.updatedAt)}</span></div><h3>{guide.title}<ArrowRight size={19}/></h3><p>{guide.summary}</p><span className="text-link">按用途挑选 <ArrowRight size={15}/></span></Link>;}
export function ReviewCard({review:r}:{review:PublicReview}) {return <article className="review"><div className="review-author"><span className="avatar" aria-hidden="true">测</span><div><strong>{r.nickname}</strong><small>{r.device}</small></div><time dateTime={r.createdAt}>{dateLabel(r.createdAt)}</time></div><h3>{r.title}</h3><p>{r.content}</p><a className="text-link" href={r.sourceUrl} target="_blank" rel="noreferrer">{r.sourceLabel}<ArrowUpRight size={15}/></a></article>;}
