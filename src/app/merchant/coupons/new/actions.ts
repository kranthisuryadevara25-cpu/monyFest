
'use server';

import { moderateOffer } from "@/ai/flows/moderate-merchant-offers";
import { z } from "zod";

const formSchema = z.object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().min(1, 'Description is required.'),
});

export async function moderateOfferAction(formData: FormData) {
    const rawFormData = {
        title: formData.get('title'),
        description: formData.get('description'),
    };
    
    const parsed = formSchema.safeParse(rawFormData);
    if (!parsed.success) {
        return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    try {
        const result = await moderateOffer(parsed.data);
        return { success: true, data: result };
    } catch (e: any) {
        return { success: false, errors: { _server: [e.message] } };
    }
}
