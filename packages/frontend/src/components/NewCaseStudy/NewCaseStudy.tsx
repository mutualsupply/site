"use client"

import { useSession } from "next-auth/react"
import { cn } from "utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAccount, useSignMessage } from "wagmi"
import { z } from "zod"
import { getDrafts, getPulls, saveDraft, submitCaseStudy } from "../../lib/api"
import { isProd } from "../../lib/env"
import { CaseStudy, StudyType } from "../../lib/interfaces"
import { BooleanStrings, caseStudyFormSchema } from "../../lib/schema"
import { Link } from "../Links"
import Section from "../Section"
import Add from "../icons/Add"
import { Button } from "../ui/button"
import { Form } from "../ui/form"
import DetailsAccordion from "./Accordions/DetailsAccordion"
import RecordAccordion from "./Accordions/RecordAccordion"
import SignInAccordion from "./Accordions/SignInAccordion"
import ThoughtsAccordion from "./Accordions/ThoughtsAccordion"
import DraftCaseStudy from "./DraftCaseStudy"

export default function NewCaseStudy() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pulls"],
    queryFn: getPulls,
    cacheTime: 0,
    refetchOnWindowFocus: true,
  })
  const onCreateSuccess = () => {
    refetch()
  }
  return (
    <div className={cn("flex", "gap-x-40", "flex-col", "md:flex-row")}>
      <div className={cn("md:max-w-xl", "w-full")}>
        <Section title="Create cultrual timestamps" size="lg">
          <div>
            This public database offers a collaborative environment for builders
            and researchers of all backgrounds to learn from and interact with
            each other.
          </div>
          <div>
            By submitting your thoughts, you{"’"}re contributing to an
            open-source knowledge base that will create cultural timestamps of
            design as it evolves in decentralized society.
          </div>
          <div>
            As the MUTUAL Library grows over time, so will the influence of your
            thoughts as they help establish patterns & trends that drive the
            evolution of user-centered design in blockchain enabled products.
          </div>
          <div>
            Before submitting, read the Best Practices Guide to understand
            requirements and internal standards. All submissions are subject to
            a review process by the MUTUAL team.
          </div>
          <Link
            href=""
            className="border-dashed border border-red-op text-red-op p-3 text-lg no-underline"
          >
            Earn $OP rewards & on-chain reputation →
          </Link>
          <Accordion
            type="multiple"
            className={cn("flex", "flex-col", "gap-8")}
          >
            <AccordionItem value="item-0">
              <AccordionTrigger>Case Studies In Progress</AccordionTrigger>
              <AccordionContent>
                {!isLoading && data && data.length > 0 && (
                  <>
                    <Link
                      isExternal
                      href={"https://github.com/mutualsupply/library/pulls"}
                      className={cn(
                        "inline-flex",
                        "items-center",
                        "gap-1",
                        "border-b",
                        "text-xs",
                        "no-underline",
                      )}
                    >
                      <span>View all on Github</span> <ArrowRightIcon />
                    </Link>
                    <div className={cn("flex", "flex-col", "gap-3", "mt-4")}>
                      {data?.map((pull) => (
                        <DraftCaseStudy pull={pull} key={pull.number} />
                      ))}
                    </div>
                  </>
                )}
                {!isLoading && (!data || data.length === 0) && (
                  <div className={cn("text-center", "my-4")}>None found</div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>
      </div>
      <div className={cn("mt-6", "md:mt-0", "w-full", "max-w-2xl")}>
        <CreateNewCaseStudy onSuccess={onCreateSuccess} />
      </div>
    </div>
  )
}

const CreateNewCaseStudy = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [view, setView] = useState<"form" | "success">("form")
  const [markdown, setMarkdown] = useState("")
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  const { data, error, isLoading, signMessage, variables } = useSignMessage()
  const { address } = useAccount()

  const { data: drafts, refetch: refetchDrafts } = useQuery({
    queryKey: ["drafts"],
    queryFn: getDrafts,
    cacheTime: 0,
    refetchOnWindowFocus: true,
  })

  const caseStudyMutation = useMutation({
    mutationFn: submitCaseStudy,
    onSuccess(): void {
      setView("success")
      if (onSuccess) {
        onSuccess()
      }
    },
  })

  const draftMutation = useMutation({
    mutationFn: saveDraft,
    onSuccess(): void {
      refetchDrafts()
    },
  })

  const defaultValues = isProd()
    ? {
        email: session?.user?.email || "",
        name: session?.user?.name || "",
        organizationName: "",
        title: "",
        industry: "",
        partOfTeam: "",
        url: "",
        type: StudyType.Signal,
      }
    : {
        email: session?.user?.email || "",
        name: session?.user?.name || "",
        title: "How to make a Case Study",
        organizationName: "MUTUAL",
        industry: "Knowledge",
        partOfTeam: BooleanStrings.True,
        url: "https://dev.mutual.supply",
        type: StudyType.Signal,
      }

  const form = useForm({
    resolver: zodResolver(caseStudyFormSchema),
    defaultValues,
  })

  const getParsedFormValues = (): CaseStudy => {
    const values = form.getValues()
    return {
      ...values,
      partOfTeam: values.partOfTeam === BooleanStrings.True,
      url: values.url === "" ? undefined : values.url,
      markdown: markdown === "" ? undefined : markdown,
    }
  }

  async function onSubmit(values: z.infer<typeof caseStudyFormSchema>) {
    if (address) {
      console.log("debug:: signing")
      const caseStudy = getParsedFormValues()
      const signedData = signMessage({
        message: JSON.stringify(caseStudy),
      })
      console.log("debug:: stuff", signedData)
      // return caseStudyMutation.mutateAsync(getParsedFormValues())
    } else {
      return caseStudyMutation.mutateAsync(getParsedFormValues())
    }
  }

  function onSaveDraft() {
    return draftMutation.mutateAsync(getParsedFormValues())
  }
  return (
    <div>
      {view === "form" && (
        <div
          className={cn(
            "flex",
            "flex-col",
            "gap-6",
            "font-medium",
            "mt-4",
            "md:mt-0",
          )}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn("space-y-8")}
            >
              <Accordion
                type="multiple"
                className={cn("flex", "flex-col", "gap-8", "w-full")}
              >
                <SignInAccordion value="item-0" />
                <ThoughtsAccordion value="item-1" />
                <RecordAccordion value="item-2" onChange={setMarkdown} />
                <DetailsAccordion value="item-3" />
              </Accordion>
              {caseStudyMutation.isError &&
                caseStudyMutation.error instanceof Error && (
                  <div className={cn("text-red")}>
                    {caseStudyMutation.error.message}
                  </div>
                )}
              <div className={cn("flex", "items-center", "gap-2")}>
                <div className={cn("w-full")}>
                  <Button
                    className={cn("w-full", "rounded-full")}
                    size="lg"
                    variant="outline"
                    disabled={!isLoggedIn || form.formState.isSubmitting}
                    onClick={onSaveDraft}
                    loading={draftMutation.isLoading}
                  >
                    <div className={cn("flex", "flex-col")}>
                      <span>Save draft</span>
                      {drafts && drafts.length > 0 && (
                        <div
                          className={cn(
                            "text-xs",
                            "text-center",
                            "text-gray-600",
                          )}
                        >
                          {drafts.length} found
                        </div>
                      )}
                    </div>
                  </Button>
                </div>
                <Button
                  size="lg"
                  type="submit"
                  className={cn("w-full", "rounded-full")}
                  disabled={!isLoggedIn || draftMutation.isLoading}
                  loading={form.formState.isSubmitting}
                >
                  {isLoggedIn ? "Submit" : "Sign in to submit"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {view === "success" && caseStudyMutation.data && (
        <Section title={caseStudyMutation.data.caseStudy.title} size="lg">
          <div>
            <div className={cn("text-xl")}>
              by: {caseStudyMutation.data?.caseStudy.name}
            </div>
          </div>
          <Link
            isExternal
            href={caseStudyMutation.data.pr.html_url}
            className={cn("text-primary", "underline")}
          >
            View on Github
          </Link>
          <Button
            variant="outline"
            className={cn(
              "rounded-full",
              "uppercase",
              "text-black",
              "flex",
              "items-center",
              "gap-2",
            )}
            onClick={() => setView("form")}
          >
            <Add fill="black" width={14} />
            <span className={cn("inline-block")}>Submit Another Report</span>
          </Button>
        </Section>
      )}
    </div>
  )
}
