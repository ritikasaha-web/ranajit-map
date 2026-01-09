import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const navBar = ({ towerId }: { towerId: string }) => {
  return (
    <Card className="w-full bg-white p-0 border-t-0 border-l-0 border-r-0 shadow-none rounded-2xl border-b-4 border-primary py-4">
      <CardHeader className=" flex justify-center py-2 px-6">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="h-13 w-30 absolute top-4 left-4"
        />
        <span className="flex-1 text-center text-4xl font-semibold">
          {towerId}
        </span>
      </CardHeader>
    </Card>
  );
};

export default navBar;
