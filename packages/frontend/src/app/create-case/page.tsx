"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, useSession } from "next-auth/react";
import { cn } from "utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import BackLink from "../../components/BackLink";
import { MilkdownEditorWrapper } from "../../components/MilkdownEditor";
import TextInput from "../../components/TextInput";
import { Button } from "../../components/ui/button";
import { Form } from "../../components/ui/form";
import { Label } from "../../components/ui/label";
import { GithubPullResponse, getPulls } from "../../lib/api";
import { caseStudySchema } from "../../lib/schema";

const NewCaseStudyPage = () => {
  return (
    <div>
      <BackLink href={"/"}>Library</BackLink>
      <div
        className={cn(
          "grid",
          "gap-24",
          "mt-4",
          "grid-cols-1",
          "md:grid-cols-12"
        )}
      >
        <div className={cn("md:col-span-4")}>
          <LeftPane />
        </div>
        <div className={cn("md:col-span-8", "mt-6", "md:mt-0")}>
          <CreateNewCaseStudy />
        </div>
      </div>
    </div>
  );
};

const LeftPane = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["pulls"],
    queryFn: getPulls,
  });
  return (
    <Accordion
      type="multiple"
      className={cn("flex", "flex-col", "gap-8")}
      defaultValue={["item-0"]}
    >
      <AccordionItem value="item-0" defaultValue={"item-0"}>
        <AccordionTrigger>Welcome</AccordionTrigger>
        <AccordionContent>
          <div className={cn("flex", "flex-col", "gap-4")}>
            <div>
              This database exists to provide a collaborative environment for
              designers, researchers and engineers to learn from and interact
              with one another.
            </div>
            <div>
              By submitting research, you're contributing to a public knowledge
              base that fuels experimentation and drives the evolution of
              user-centered design in blockchain products.
            </div>
            <div>
              We're excited to be a part of your process as you prepare your
              report. Before submitting, read the{" "}
              <Link href="/best-practices" className={cn("text-primary")}>
                Best Practices Guide
              </Link>{" "}
              to understand requirements and internal standards. All reports are
              subject to an approval process based on guidelines you will find
              in our documentation.
            </div>
            <div>Database & online experience maintaned by MUTUAL</div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-1">
        <AccordionTrigger>Best Practices Guide</AccordionTrigger>
        <AccordionContent>~ Mutually supply with us please ~</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Case Studies In Progress</AccordionTrigger>
        <AccordionContent>
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href={"https://github.com/mutualsupply/site/pulls"}
            className={cn(
              "inline-flex",
              "items-center",
              "text-primary",
              "gap-1",
              "border-b",
              "text-xs"
            )}
          >
            <span>View all on Github</span> <ArrowRightIcon />
          </Link>
          {!isLoading && data && (
            <div className={cn("flex", "flex-col", "gap-3", "mt-4")}>
              {data?.map((pull) => (
                <DraftCaseStudy pull={pull} key={pull.number} />
              ))}
            </div>
          )}
          {!isLoading && !data && (
            <div className={cn("text-center", "text-primary")}>
              No case studies in progress
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

interface DraftCaseStudyProps {
  pull: GithubPullResponse[number];
}

const DraftCaseStudy = ({ pull }: DraftCaseStudyProps) => {
  return (
    <Link
      target={"_blank"}
      href={pull.html_url}
      className={cn("p-4", "border")}
    >
      <div className={cn("underline", "font-aspekta", "font-light")}>
        {pull.title}
      </div>
      <div className={cn("text-primary", "mt-2")}>{pull.user?.login}</div>
    </Link>
  );
};

const CreateNewCaseStudy = () => {
  const { data: session } = useSession();
  const isLoggedIn = session?.user?.name;
  return (
    <div>
      <div className={cn("text-6xl", "text-primary", "font-otBrut", "mb-6")}>
        Submit a Report
      </div>
      <div className={cn("flex", "flex-col", "gap-6")}>
        <div>
          Welcom to the MUTUAL research collective. Please read the{" "}
          <Link href={"/best-practices"}>Best Practices Guide</Link> before
          submitting your report. All reports are subject to an approval process
          by the MUTUAL team, based on guidelines outlined in our documentation
        </div>
        <div>
          Connect your Github to earn provenance as the author of this report.{" "}
          <Link href={"/how-this-works"}>How this works</Link>
        </div>
      </div>
      <div className={cn("mt-6")}>
        {isLoggedIn && (
          <div className={cn("flex", "justify-between", "items-center")}>
            <div className={cn("flex", "items-center", "gap-2")}>
              <div>
                Logged in as:{" "}
                <span className={cn("font-bold", "inline-flex", "gap-1")}>
                  {session?.user?.name}
                  {session?.user?.image && (
                    <Image
                      src={session.user.image}
                      height={25}
                      width={25}
                      alt={"pfp"}
                      className={cn("rounded-full")}
                    />
                  )}
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={() => signOut()}>
              logout
            </Button>
          </div>
        )}
        {!isLoggedIn && (
          <div>
            <Button
              variant={"outline"}
              onClick={() =>
                signIn("github", {
                  callbackUrl: `${window.location.origin}/create-case`,
                })
              }
            >
              Sign in to Github
            </Button>
          </div>
        )}
      </div>
      <div
        className={cn("my-6", "p-3", "border", "border-dashed", "text-primary")}
      >
        Something something about capabilities to save your report as a draft
        and edit it later, etc etc.
      </div>
      <NewCaseStudyForm />
    </div>
  );
};

const NewCaseStudyForm = () => {
  const { data: session } = useSession();
  const isLoggedIn = session?.user?.name;
  const [markdown, setMarkdown] = useState("");
  const form = useForm({
    resolver: zodResolver(caseStudySchema),
    defaultValues: {
      email: session?.user?.email || "",
      name: session?.user?.name || "",
      title: "",
      productDescription: "",
      industry: "",
    },
  });
  async function onSubmit(values: z.infer<typeof caseStudySchema>) {
    const res = await fetch("/api/create-case", {
      method: "POST",
      body: JSON.stringify({
        ...values,
        markdown,
      }),
      credentials: "same-origin",
    });
    if (!res.ok) {
      console.error("Could not create case study pr");
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4")}>
        <TextInput name="email" type="email" label="Email" />
        <TextInput name="name" label="Your Name" />
        <TextInput name="title" label="Title of the Report" />
        <TextInput
          name="productDescription"
          label="In 1-2 sentences, please briefly outline the main purpose of the product you are analyzing"
        />
        <TextInput
          name="industry"
          label="In which industry would you place this product?"
        />
        <div className={cn("flex", "flex-col", "gap-3")}>
          <Label>Details</Label>
          <MilkdownEditorWrapper onChange={setMarkdown} />
        </div>
        <div className={cn("flex", "justify-center")}>
          <Button disabled={!isLoggedIn} type="submit">
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewCaseStudyPage;
