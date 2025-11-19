"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import FeatureEdit from "./featureEdit";
import AttributeEdit from "./attributeEdit";

interface EditTwinProps {
  data?: any;
}

export default function EditTwin({ data }: EditTwinProps) {
  const features = data?.features || {};
  const attributes = data?.attributes || {};

  return (
    <main className="min-h-screen bg-background p-8 pb-0">
      <div className="w-full mx-auto">
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="pr-4">
              <div className="text-2xl font-semibold">Edit Twin</div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex w-full gap-4 border-4 border-primary p-4 rounded-lg">
                <FeatureEdit data={features} />
                <AttributeEdit data={attributes} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
