import Link from "./link";
import {ArrowUpRight,ArrowRight,BookOpen} from "lucide-react";
import type {ReactNode} from "react";
import type {Reading} from "@/lib/domain";
import {dateLabel} from "@/lib/domain";

export function PageHeading({title,description,children}:{title:string;description:string;children?:ReactNode}) {return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{children}</div>;}
export function SectionHeading({title,description,href,label="查看全部"}:{title:string;description?:string;href?:string;label?:string}) {return <div className="section-heading"><div><h2>{title}</h2>{description&&<p>{description}</p>}</div>{href&&<Link className="text-link" href={href}>{label}<ArrowRight size={16}/></Link>}</div>;}
export function EmptyState({title,description,href,label}:{title:string;description:string;href?:string;label?:string}) {return <div className="empty-state"><BookOpen size={26}/><h3>{title}</h3><p>{description}</p>{href&&<Link href={href} className="button">{label??"去看看"}<ArrowUpRight size={15}/></Link>}</div>;}
export function ReadingCard({reading}:{reading:Reading}) {return <a className="reading-card" href={reading.url} target="_blank" rel="noreferrer"><div className="reading-meta"><BookOpen size={16}/><span>{reading.author}</span><span>{dateLabel(reading.date)}</span></div><h3>{reading.title}<ArrowUpRight size={19}/></h3><p>{reading.description}</p><span className="text-link">阅读原文 <ArrowRight size={15}/></span></a>;}
