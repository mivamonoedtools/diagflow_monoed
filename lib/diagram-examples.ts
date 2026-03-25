import type { DiagramKind } from "@/lib/diagram-kinds";

export type DiagramExample = {
  id: string;
  title: string;
  description: string;
  samplePrompt: string;
  diagramKind: DiagramKind;
};

export const DIAGRAM_EXAMPLES: DiagramExample[] = [
  {
    id: "checkout-flow",
    title: "Checkout decision flow",
    description: "Simple flowchart with a decision and two outcomes.",
    diagramKind: "flowchart",
    samplePrompt:
      "Flowchart for an e-commerce checkout: cart → sign in (guest or account) → shipping → payment → confirmation. Add a decision if payment fails, loop back to payment.",
  },
  {
    id: "api-sequence",
    title: "REST API sequence",
    description: "Client, API, and database over time.",
    diagramKind: "sequence",
    samplePrompt:
      "Sequence diagram: mobile app calls POST /orders, API validates JWT with auth service, then inserts order in Postgres and returns 201 with order id. Show failures: 401 if token invalid.",
  },
  {
    id: "domain-model",
    title: "Small class model",
    description: "Classes and inheritance for a blog domain.",
    diagramKind: "class",
    samplePrompt:
      "Class diagram: User has many Posts; Post has many Comments; Comment belongs to User. Admin is a subclass of User with moderatePost().",
  },
  {
    id: "order-states",
    title: "Order state machine",
    description: "State diagram for order lifecycle.",
    diagramKind: "state",
    samplePrompt:
      "State diagram for an order: Pending → Paid → Shipped → Delivered. From Pending can cancel to Cancelled. From Shipped allow ReturnStarted → Returned.",
  },
  {
    id: "mini-er",
    title: "ER snippet",
    description: "Entities and relationships for courses.",
    diagramKind: "er",
    samplePrompt:
      "ER diagram: STUDENT enrolls in many COURSE; COURSE taught by one TEACHER; ENROLLMENT has grade and enrolled_on.",
  },
  {
    id: "sprint-gantt",
    title: "Two-week sprint",
    description: "Gantt-style plan with sections.",
    diagramKind: "gantt",
    samplePrompt:
      "Gantt: dateFormat YYYY-MM-DD. Two-week sprint from 2025-06-02 to 2025-06-13. Sections Design, Build, QA with tasks using only YYYY-MM-DD start/end dates (no mixed formats).",
  },
  {
    id: "budget-pie",
    title: "Budget breakdown",
    description: "Pie chart with a few slices.",
    diagramKind: "pie",
    samplePrompt:
      'Pie chart titled Monthly budget: "Rent" 1400, "Food" 450, "Transit" 120, "Savings" 300, "Other" 230. Use showData.',
  },
];
