
"use client";

import ContainerCard from "@/app/components/containerCard";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import InputFields from "@/app/components/inputFields";
import StepperForm, {
    StepperStep,
    useStepperForm,
} from "@/app/components/stepperForm";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import axios from "axios";
import {
    ErrorMessage,
    Form,
    Formik,
    FormikErrors,
    FormikHelpers,
    FormikTouched,
} from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

import Loading from "@/app/components/Loading";
import { saveFinalCode } from "@/app/services/allApi";
import {
    addServiceVisit,
    chillerList,
    getServiceVisitById,
    getTechicianList,
    serviceVisitGenearateCode,
    updateServiceVisit
} from "@/app/services/assetsApi";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "@/app/components/smartLink";

// File validation helper
const FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const SUPPORTED_FORMATS = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileValidation = Yup.mixed()
    .test("fileSize", "File too large (max 10MB)", (value) => {
        if (!value) return true; // No file is valid (optional field)
        if (value instanceof File) {
            return value.size <= FILE_SIZE;
        }
        return true; // If it's a string (existing file), it's valid
    })
    .test("fileFormat", "Unsupported Format", (value) => {
        if (!value) return true; // No file is valid (optional field)
        if (value instanceof File) {
            return SUPPORTED_FORMATS.includes(value.type);
        }
        return true; // If it's a string (existing file), it's valid
    });

const validationSchema = Yup.object({
    ticket_type: Yup.string()
        .trim()
        .max(100, "Ticket Type cannot exceed 100 characters"),
    time_in: Yup.string()
        .trim()
        .max(100, "Time In cannot exceed 100 characters"),
    time_out: Yup.string()
        .trim()
        .max(100, "Time Out cannot exceed 100 characters"),
    outlet_name: Yup.string()
        .trim()
        .required("Outlet Name is required")
        .max(100, "Outlet Name cannot exceed 100 characters"),
    // owner_name: Yup.string()
    //     .trim()
    //     .required("Owner Name is required")
    //     .max(100, "Owner Name cannot exceed 100 characters"),
    contact_person: Yup.string()
        .trim()
        .max(100, "Contact Person cannot exceed 100 characters"),
    technician_id: Yup.string()
        .trim()
        .max(100, "Technician ID cannot exceed 100 characters"),
    ticket_status: Yup.boolean(),
    cts_comment: Yup.string()
        .trim()
        .max(255, "CTS Comment cannot exceed 255 characters"),
    chiller_id: Yup.string()
        .trim()
        .max(100, "Chiller ID cannot exceed 100 characters"),
    model_no: Yup.string()
        .trim()
        .max(100, "Model No cannot exceed 100 characters"),
    serial_no: Yup.string()
        .trim()
        .max(100, "Serial No cannot exceed 100 characters"),
    asset_no: Yup.string()
        .trim()
        .max(100, "Asset No cannot exceed 100 characters"),
    branding: Yup.string()
        .trim()
        .max(100, "Branding cannot exceed 100 characters"),
    nature_of_call_id: Yup.number()
        .max(255, "Nature of Call cannot exceed 255 characters"),
    current_voltage: Yup.string()
        .trim()
        .max(100, "Current Voltage cannot exceed 100 characters"),
    amps: Yup.string()
        .trim()
        .max(100, "Amps cannot exceed 100 characters"),
    cabin_temperature: Yup.string()
        .trim()
        .max(100, "Cabin Temperature cannot exceed 100 characters"),
    work_status: Yup.string()
        .trim()
        .max(100, "Work Status cannot exceed 100 characters"),
    type_details_photo1: fileValidation,
    type_details_photo2: fileValidation,
    technical_behaviour: Yup.string()
        .trim()
        .max(255, "Technical Behaviour cannot exceed 255 characters"),
    service_quality: Yup.string()
        .trim()
        .max(255, "Service Quality cannot exceed 255 characters"),
    customer_signature: fileValidation,
    is_machine_in_working: Yup.boolean(),
    cleanliness: Yup.boolean(),
    condensor_coil_cleand: Yup.boolean(),
    gaskets: Yup.boolean(),
    light_working: Yup.boolean(),
    branding_no: Yup.boolean(),
    propper_ventilation_available: Yup.boolean(),
    leveling_positioning: Yup.boolean(),
    stock_availability_in: Yup.boolean(),
    is_machine_in_working_img: fileValidation,
    cleanliness_img: fileValidation,
    condensor_coil_cleand_img: fileValidation,
    stock_availability_in_img: fileValidation,
    cooler_image: fileValidation,
    cooler_image2: fileValidation,

});

const stepSchemas = [
    // Step 1: Basic Outlet Information
    Yup.object().shape({
        ticket_type: validationSchema.fields.ticket_type,
        time_in: validationSchema.fields.time_in,
        time_out: validationSchema.fields.time_out,
        ticket_status: validationSchema.fields.ticket_status,
    }),
    Yup.object().shape({
        outlet_name: validationSchema.fields.outlet_name,
        // owner_name: validationSchema.fields.owner_name,
        contact_person: validationSchema.fields.contact_person,
        technician_id: validationSchema.fields.technician_id,
        cts_comment: validationSchema.fields.cts_comment,

    }),

    // Step 2: Location and Personnel
    Yup.object().shape({
        chiller_id: validationSchema.fields.chiller_id,
        model_no: validationSchema.fields.model_no,
        serial_no: validationSchema.fields.serial_no,
        asset_no: validationSchema.fields.asset_no,
        branding: validationSchema.fields.branding,
    }),

    Yup.object().shape({
        nature_of_call_id: validationSchema.fields.nature_of_call_id,
        current_voltage: validationSchema.fields.current_voltage,
        amps: validationSchema.fields.amps,
        cabin_temperature: validationSchema.fields.cabin_temperature,
    }),

    Yup.object().shape({
        work_status: validationSchema.fields.work_status,
        type_details_photo1: validationSchema.fields.type_details_photo1,
        type_details_photo2: validationSchema.fields.type_details_photo2,
        technical_behaviour: validationSchema.fields.technical_behaviour,
        service_quality: validationSchema.fields.service_quality,
        customer_signature: validationSchema.fields.customer_signature,
    }),

    Yup.object().shape({
        is_machine_in_working: validationSchema.fields.is_machine_in_working,
        cleanliness: validationSchema.fields.cleanliness,
        condensor_coil_cleand: validationSchema.fields.condensor_coil_cleand,
        gaskets: validationSchema.fields.gaskets,
        light_working: validationSchema.fields.light_working,
        branding_no: validationSchema.fields.branding_no,
        propper_ventilation_available: validationSchema.fields.propper_ventilation_available,
        leveling_positioning: validationSchema.fields.leveling_positioning,
        stock_availability_in: validationSchema.fields.stock_availability_in,
        is_machine_in_working_img: validationSchema.fields.is_machine_in_working_img,
        cleanliness_img: validationSchema.fields.cleanliness_img,
        condensor_coil_cleand_img: validationSchema.fields.condensor_coil_cleand_img,
        stock_availability_in_img: validationSchema.fields.stock_availability_in,
        cooler_image: validationSchema.fields.cooler_image,
        cooler_image2: validationSchema.fields.cooler_image2,
    }),
];

type ServiceVisit = {
    model_name: string;
    osa_code: string;
    outlet_name: string;
    // owner_name: string;
    contact_person: string;
    ticket_type: string;
    time_in: string;
    time_out: string;
    status: string;
    model_no: string;
    serial_no: string;
    asset_no: string;
    branding: string;
    ticket_status: string;
    ct_status: string;
    technician_id: string;
    is_machine_in_working: string;
    cleanliness: string;
    condensor_coil_cleand: string;
    gaskets: string;
    light_working: string;
    branding_no: string;
    propper_ventilation_available: string;
    leveling_positioning: string;
    stock_availability_in: string;
    cts_comment: string;
    current_voltage: string;
    amps: string;
    chiller_id: string;
    cabin_temperature: string;
    work_status: string;
    technical_behaviour: string;
    service_quality: string;
    nature_of_call_id: string;
    type_details_photo1: string | File;
    type_details_photo2: string | File;
    is_machine_in_working_img: string | File;
    cleanliness_img: string | File;
    condensor_coil_cleand_img: string | File;
    stock_availability_in_img: string | File;
    cooler_image: string | File;
    cooler_image2: string | File;
    customer_signature: string | File;
};

type DropdownOption = {
    value: string;
    label: string;
};

type FileField = {
    fieldName: keyof ServiceVisit;
    label: string;
    accept?: string;
};

const TICKET_MODEL_MAP: Record<string, string> = {
    BD: "BD",
    RB: "RB",
    TR: "TR",
};


const fileFields: FileField[] = [
    { fieldName: "type_details_photo1", label: "Type Details Photo 1", accept: "image/*,.pdf" },
    { fieldName: "type_details_photo2", label: "Type Details Photo 2", accept: "image/*,.pdf" },
    { fieldName: "is_machine_in_working_img", label: "Is Machine In Working Img", accept: "image/*,.pdf" },
    { fieldName: "cleanliness_img", label: "Cleanliness Img", accept: "image/*,.pdf" },
    { fieldName: "condensor_coil_cleand_img", label: "Condensor Coil Cleaned Img", accept: "image/*,.pdf" },
    { fieldName: "stock_availability_in_img", label: "Stock Availability In Img", accept: "image/*,.pdf" },
    { fieldName: "cooler_image", label: "Cooler Image", accept: "image/*,.pdf" },
    { fieldName: "cooler_image2", label: "Cooler Image 2", accept: "image/*,.pdf" },
    { fieldName: "customer_signature", label: "Customer Signature", accept: "image/*,.pdf" },
];

// Create axios instance for form data
const APIFormData = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

APIFormData.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default function AddServiceVisitStepper() {
    const [uploadedFiles, setUploadedFiles] = useState<
        Record<string, { file: File; preview?: string }>
    >({});
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [existingData, setExistingData] = useState<ServiceVisit | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { channelOptions, assetsModelOptions, agentCustomerOptions, brandingOptions, ensureAgentCustomerLoaded, ensureBrandingLoaded, ensureChannelLoaded, ensureAssetsModelLoaded, ensureLocationLoaded } = useAllDropdownListData();
    const [technicianOptions, setTechnicianOptions] = useState<{ value: string; label: string }[]>([]);
    const [chillerOptions, setChillerOptions] = useState<{ value: string; label: string }[]>([]);
    const codeGeneratedRef = useRef(false);
    const params = useParams();
    const uuid = params?.id;
    const isAddMode = uuid === "add" || !uuid;
    const [chillers, setChillers] = useState<any[]>([]);


    const steps: StepperStep[] = [
        { id: 1, label: "Basic Information" },
        { id: 2, label: "Current Customer Details" },
        { id: 3, label: "Fridge Details" },
        { id: 4, label: "Work Details" },
        { id: 5, label: "Work Done Details" },
        { id: 6, label: "Equipment Condition" },
    ];

    const {
        currentStep,
        nextStep,
        prevStep,
        markStepCompleted,
        isStepCompleted,
        isLastStep,
    } = useStepperForm(steps.length);

    const { showSnackbar } = useSnackbar();
    const router = useRouter();

    useEffect(() => {
        ensureChannelLoaded();
        ensureLocationLoaded();
        ensureAssetsModelLoaded();
        ensureBrandingLoaded();
        ensureAgentCustomerLoaded();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const response = await getTechicianList();
                const techData = Array.isArray(response?.data)
                    ? response.data
                    : (response?.data?.data || []);

                const options = techData.map((item: { id: string | number; osa_code: string; name: string }) => ({
                    value: String(item.id),
                    label: `${item.osa_code} - ${item.name}`,
                }));

                setTechnicianOptions(options);
            } catch (error) {
                showSnackbar("Failed to fetch technician data", "error");
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const response = await chillerList();

                const chillerData = Array.isArray(response?.data)
                    ? response.data
                    : response?.data?.data ?? [];

                setChillers(chillerData);

                const options = chillerData.map((item: any) => ({
                    value: String(item.id),
                    label: item.osa_code,
                }));

                setChillerOptions(options);
            } catch (error) {
                showSnackbar("Failed to fetch chiller data", "error");
            }
        })();
    }, []);

    // This effect will be handled inside the Formik component through onChange handler



    useEffect(() => {
        const checkEditMode = async () => {
            if (uuid && uuid !== "add") {
                setIsEditMode(true);
                await fetchExistingData(uuid.toString());
            } else {
                setIsEditMode(false);
                setIsLoading(false);
            }
        };

        checkEditMode();
    }, [uuid]);

    useEffect(() => {
        if (!isEditMode || existingData) {
        }
    }, [isEditMode, existingData]);

    const fetchExistingData = async (uuid: string) => {
        try {
            setIsLoading(true);
            const res = await getServiceVisitById(uuid);

            if (res.status === "success" && res.data) {
                const data = res.data;

                // Transform the API response to match our ServiceVisit type
                const transformedData: ServiceVisit = {
                    model_name: data.model_name || "",
                    osa_code: data.osa_code || "",
                    outlet_name: data.outlet_name || "",
                    // owner_name: data.owner_name || "",
                    contact_person: data.contact_person || "",
                    ticket_type: data.ticket_type || "",
                    time_in: data.time_in || "",
                    time_out: data.time_out || "",
                    model_no: data.model_no || "",
                    status: data.status || "",
                    serial_no: data.serial_no || "",
                    asset_no: data.asset_no || "",
                    branding: data.branding || "",
                    ticket_status: data.ticket_status || "",
                    ct_status: data.ct_status || "",
                    chiller_id: data.chiller_id || "",
                    is_machine_in_working: data.is_machine_in_working || "",
                    cleanliness: data.cleanliness || "",
                    condensor_coil_cleand: data.condensor_coil_cleand || "",
                    gaskets: data.gaskets || "",
                    light_working: data.light_working || "",
                    branding_no: data.branding_no || "",
                    propper_ventilation_available: data.propper_ventilation_available || "",
                    leveling_positioning: data.leveling_positioning || "",
                    stock_availability_in: data.stock_availability_in || "",
                    cts_comment: data.cts_comment || "",
                    current_voltage: data.current_voltage || "",
                    amps: data.amps || "",
                    cabin_temperature: data.cabin_temperature || "",
                    work_status: data.work_status || "",
                    technical_behaviour: data.technical_behaviour || "",
                    service_quality: data.service_quality || "",
                    nature_of_call_id: data.nature_of_call_id || "",
                    technician_id: data.technician_id || "",
                    type_details_photo1: data.type_details_photo1 || "",
                    type_details_photo2: data.type_details_photo2 || "",
                    is_machine_in_working_img: data.is_machine_in_working_img || "",
                    cleanliness_img: data.cleanliness_img || "",
                    condensor_coil_cleand_img: data.condensor_coil_cleand_img || "",
                    stock_availability_in_img: data.stock_availability_in_img || "",
                    cooler_image: data.cooler_image || "",
                    cooler_image2: data.cooler_image2 || "",
                    customer_signature: data.customer_signature || "",
                };

                setExistingData(transformedData);

                // Set uploaded files for existing file names
                const fileFieldsToCheck = [
                    "type_details_photo1",
                    "type_details_photo2",
                    "is_machine_in_working_img",
                    "cleanliness_img",
                    "condensor_coil_cleand_img",
                    "gaskets_img",
                    "light_working_img",
                    "branding_no_img",
                    "propper_ventilation_available_img",
                    "leveling_positioning_img",
                    "stock_availability_in_img",
                    "cooler_image",
                    "cooler_image2",
                    "customer_signature",
                ];

                const initialUploadedFiles: Record<
                    string,
                    { file: File; preview?: string }
                > = {};
                fileFieldsToCheck.forEach((field) => {
                    if (transformedData[field as keyof ServiceVisit]) {
                        initialUploadedFiles[field] = {
                            file: new File(
                                [],
                                transformedData[field as keyof ServiceVisit] as string
                            ),
                            preview: undefined,
                        };
                    }
                });
                setUploadedFiles(initialUploadedFiles);
            } else {
                showSnackbar("Failed to fetch service visit data", "error");
            }
        } catch (error) {
            console.error("Error fetching existing data:", error);
            showSnackbar("Failed to fetch service visit data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const ticketTypeRef = useRef<string>("");

    const handleTicketTypeChange = async (ticketType: string) => {
        if (!ticketType) return;

        const modelName = TICKET_MODEL_MAP[ticketType];
        if (!modelName) return;

        // prevent re-trigger in edit mode
        if (codeGeneratedRef.current) return;

        try {
            codeGeneratedRef.current = true;

            const res = await serviceVisitGenearateCode({
                model_name: modelName,
            });

            // This will be called from the form with setFieldValue
        } catch (err) {
            showSnackbar("Failed to generate code", "error");
        }
    };



    const handleFileChange = (
        fieldName: keyof ServiceVisit,
        event: React.ChangeEvent<HTMLInputElement>,
        setFieldValue: FormikHelpers<ServiceVisit>["setFieldValue"]
    ) => {
        const file = event.target.files?.[0];
        if (file) {

            if (file.size > FILE_SIZE) {
                showSnackbar(
                    `File size must be less than 10MB for ${fieldName}`,
                    "error"
                );
                event.target.value = "";
                return;
            }


            if (!SUPPORTED_FORMATS.includes(file.type)) {
                showSnackbar(
                    `Unsupported file format for ${fieldName}. Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF`,
                    "error"
                );
                event.target.value = ""; // Clear the input
                return;
            }

            setFieldValue(fieldName, file);

            // Generate preview for images
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setUploadedFiles((prev) => ({
                        ...prev,
                        [fieldName]: {
                            file,
                            preview: e.target?.result as string,
                        },
                    }));
                };
                reader.readAsDataURL(file);
            } else {
                setUploadedFiles((prev) => ({
                    ...prev,
                    [fieldName]: { file },
                }));
            }

            showSnackbar(`File "${file.name}" selected for ${fieldName}`, "success");
        }
    };

    const removeFile = (
        fieldName: keyof ServiceVisit,
        setFieldValue: (
            field: keyof ServiceVisit,
            value: ServiceVisit,
            shouldValidate?: boolean
        ) => void
    ) => {
        setUploadedFiles((prev) => {
            const newFiles = { ...prev };
            delete newFiles[fieldName];
            return newFiles;
        });
        showSnackbar(`File removed from ${fieldName}`, "info");
    };

    const renderFileInput = (
        fieldName: keyof ServiceVisit,
        label: string,
        values: ServiceVisit,
        setFieldValue: FormikHelpers<ServiceVisit>["setFieldValue"],
        errors: FormikErrors<ServiceVisit>,
        touched: FormikTouched<ServiceVisit>,
        accept?: string
    ) => {
        const fileInfo = uploadedFiles[fieldName];
        const currentValue = values[fieldName];
        const hasFile =
            fileInfo || (typeof currentValue === "string" && currentValue);

        return (
            <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>

                {!hasFile ? (
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Icon
                                    icon="lucide:upload"
                                    className="w-8 h-8 mb-4 text-gray-500"
                                />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    PDF, DOC, JPG, PNG, GIF (MAX 10MB)
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept={accept || ".pdf,.doc,.docx,image/*"}
                                onChange={(e) => handleFileChange(fieldName, e, setFieldValue)}
                            />
                        </label>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                            {fileInfo?.preview ? (
                                <img
                                    src={fileInfo.preview}
                                    alt="Preview"
                                    className="w-12 h-12 object-cover rounded"
                                />
                            ) : (
                                <Icon icon="lucide:file" className="w-8 h-8 text-gray-500" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {fileInfo
                                        ? fileInfo.file.name
                                        : typeof currentValue === "string"
                                            ? currentValue
                                            : "File"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {fileInfo
                                        ? `${(fileInfo.file.size / 1024 / 1024).toFixed(2)} MB`
                                        : "Uploaded file"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeFile(fieldName, setFieldValue)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Icon icon="lucide:trash-2" className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {touched[fieldName] && errors[fieldName] && (
                    <div className="text-sm text-red-600 mt-1">
                        {errors[fieldName] as string}
                    </div>
                )}
            </div>
        );
    };

    const initialValues: ServiceVisit = {
        model_name: "",
        osa_code: "",
        outlet_name: "",
        // owner_name: "",
        contact_person: "",
        ticket_type: "",
        time_in: "",
        time_out: "",
        status: "",
        model_no: "",
        serial_no: "",
        asset_no: "",
        branding: "",
        ticket_status: "",
        ct_status: "",
        chiller_id: "",
        is_machine_in_working: "",
        cleanliness: "",
        condensor_coil_cleand: "",
        gaskets: "",
        light_working: "",
        branding_no: "",
        propper_ventilation_available: "",
        leveling_positioning: "",
        stock_availability_in: "",
        cts_comment: "",
        current_voltage: "",
        amps: "",
        cabin_temperature: "",
        work_status: "",
        technical_behaviour: "",
        service_quality: "",
        nature_of_call_id: "",
        technician_id: "",
        type_details_photo1: "",
        type_details_photo2: "",
        is_machine_in_working_img: "",
        cleanliness_img: "",
        condensor_coil_cleand_img: "",
        stock_availability_in_img: "",
        cooler_image: "",
        cooler_image2: "",
        customer_signature: "",
    };

    const stepFields = [
        ["owner_name", "outlet_name", "landmark", "district", "location", "town_village", "longitude", "latitude", "contact_no", "contact_no2", "contact_person", "ticket_type", "time_in", "time_out", "model_no", "serial_no", "asset_no", "branding", "ticket_status", "is_machine_in_working", "cleanliness", "condensor_coil_cleand", "gaskets", "light_working", "branding_no", "propper_ventilation_available", "leveling_positioning", "stock_availability_in", "complaint_type", "comment", "cts_comment", "spare_part_used", "pending_other_comments", "any_dispute", "current_voltage", "amps", "cabin_temperature", "work_status", "wrok_status_pending_reson", "spare_request", "work_done_type", "spare_details", "technical_behaviour", "service_quality", "nature_of_call_id", "technician_id", "type_details_photo1", "type_details_photo2"],
        ["is_machine_in_working_img", "cleanliness_img", "condensor_coil_cleand_img", "gaskets_img", "light_working_img", "branding_no_img", "propper_ventilation_available_img", "leveling_positioning_img", "stock_availability_in_img", "cooler_image", "cooler_image2", "customer_signature"],

    ];

    const handleNext = async (
        values: ServiceVisit,
        actions: FormikHelpers<ServiceVisit>
    ) => {
        try {
            const schema = stepSchemas[currentStep - 1];
            await schema.validate(values, { abortEarly: false });
            markStepCompleted(currentStep);
            nextStep();
        } catch (err: unknown) {
            if (err instanceof Yup.ValidationError) {
                const errors: FormikErrors<ServiceVisit> = {};
                const touched: FormikTouched<ServiceVisit> = {};
                // Only include fields for the current step
                const fields = stepFields[currentStep - 1];
                err.inner.forEach((error) => {
                    if (error.path && fields.includes(error.path)) {
                        errors[error.path as keyof ServiceVisit] = error.message;
                        touched[error.path as keyof ServiceVisit] = true;
                    }
                });
                actions.setErrors(errors);
                actions.setTouched(touched);
            }
            showSnackbar("Please fix validation errors before proceeding", "error");
        }
    };

    const handleSubmit = async (values: ServiceVisit) => {
        try {
            setIsSubmitting(true);
            await validationSchema.validate(values, { abortEarly: false });

            // Create FormData for file upload
            const formData = new FormData();

            // Append all non-file fields
            Object.keys(values).forEach((key) => {
                const value = values[key as keyof ServiceVisit];

                // Skip file fields for now (they will be appended separately)
                if (value instanceof File) {
                    return;
                }

                if (value !== null && value !== undefined && value !== "") {
                    formData.append(key, value.toString());
                }
            });

            // Append file fields
            fileFields.forEach((fileField) => {
                const fileValue = values[fileField.fieldName];
                if (fileValue instanceof File) {
                    formData.append(fileField.fieldName, fileValue);
                } else if (typeof fileValue === "string" && fileValue) {
                    // For existing files in edit mode, you might want to handle them differently
                    // If it's a string (existing file path), you can append it as is or skip
                    // formData.append(fileField.fieldName, fileValue);
                }
            });

            let res;
            if (isEditMode && uuid) {
                // Update existing record with FormData
                res = await updateServiceVisit(uuid.toString(), formData);
            } else {
                // Create new record with FormData
                res = await addServiceVisit(formData);
            }

            if (res.error) {
                showSnackbar(
                    res.data?.message ||
                    `Failed to ${isEditMode ? "update" : "add"} Service Visit`,
                    "error"
                );
            } else {
                showSnackbar(
                    `Service Visit ${isEditMode ? "updated" : "added"} successfully`,
                    "success"
                );

                if (isAddMode) {
                    await saveFinalCode({
                        reserved_code: values.osa_code,
                        model_name: TICKET_MODEL_MAP[values.ticket_type],
                    });
                }
                router.push("/serviceVisit");
            }
        } catch (error) {
            console.error("Submit error:", error);
            showSnackbar(
                `${isEditMode ? "Update" : "Add"} Service Visit failed ❌`,
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = (
        values: ServiceVisit,
        setFieldValue: FormikHelpers<ServiceVisit>["setFieldValue"],
        errors: FormikErrors<ServiceVisit>,
        touched: FormikTouched<ServiceVisit>
    ) => {
        if (loading) {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <Loading />
                </div>
            );
        }

        switch (currentStep) {
            case 1:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputFields
                                    required
                                    label="Ticket Type"
                                    name="ticket_type"
                                    value={values.ticket_type}
                                    options={[
                                        { label: "BD", value: "BD" },
                                        { label: "RB", value: "RB" },
                                        { label: "TR", value: "TR" },
                                    ]}
                                    onChange={async (e) => {
                                        const ticketType = e.target.value;

                                        // reset guard when ticket type changes
                                        if (ticketType !== values.ticket_type) {
                                            codeGeneratedRef.current = false;
                                        }

                                        setFieldValue("ticket_type", ticketType);

                                        const modelName = TICKET_MODEL_MAP[ticketType];
                                        if (!modelName) return;

                                        if (codeGeneratedRef.current) return;
                                        codeGeneratedRef.current = true;

                                        try {
                                            const res = await serviceVisitGenearateCode({
                                                prefix: modelName,
                                            });

                                            setFieldValue("prefix", modelName);
                                            setFieldValue("osa_code", res?.data?.osa_code || "");
                                        } catch (err) {
                                            codeGeneratedRef.current = false; // allow retry
                                            showSnackbar("Failed to generate code", "error");
                                        }
                                    }}
                                    error={touched.ticket_type && errors.ticket_type}
                                />

                                <ErrorMessage
                                    name="ticket_type"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Code"
                                    name="osa_code"
                                    value={values.osa_code}
                                    disabled
                                    onChange={(e) => setFieldValue("osa_code", e.target.value)}
                                    error={touched.osa_code && errors.osa_code}
                                />
                            </div>
                            <div>
                                <InputFields
                                    required
                                    label="Ticket Status"
                                    name="ticket_status"
                                    value={values.ticket_status}
                                    options={[
                                        { value: "0", label: "Pending" },
                                        { value: "1", label: "Closed By Technician" },
                                    ]}
                                    onChange={(e) => setFieldValue("ticket_status", e.target.value)}
                                    error={touched.ticket_status && errors.ticket_status}
                                />
                            </div>
                            <div>
                                <InputFields
                                    required
                                    label="Time In"
                                    name="time_in"
                                    type="date"
                                    value={values.time_in}
                                    onChange={(e) => setFieldValue("time_in", e.target.value)}
                                    error={touched.time_in && errors.time_in}
                                />
                                <ErrorMessage
                                    name="time_in"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    required
                                    label="Time Out"
                                    name="time_out"
                                    type="date"
                                    value={values.time_out}
                                    onChange={(e) => setFieldValue("time_out", e.target.value)}
                                    error={touched.time_out && errors.time_out}
                                />
                                <ErrorMessage
                                    name="time_out"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                        </div>
                    </ContainerCard>
                );
            case 2:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputFields
                                    required
                                    label="Outlet Name"
                                    name="outlet_name"
                                    value={values.outlet_name}
                                    options={agentCustomerOptions}
                                    onChange={(e) => setFieldValue("outlet_name", e.target.value)}
                                    error={touched.outlet_name && errors.outlet_name}
                                />
                            </div>
                            <div>
                                <InputFields
                                    required
                                    label="Contact Person"
                                    name="contact_person"
                                    value={values.contact_person}
                                    onChange={(e) => setFieldValue("contact_person", e.target.value)}
                                    error={touched.contact_person && errors.contact_person}
                                />
                                <ErrorMessage
                                    name="contact_person"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    required
                                    label="Technician"
                                    name="technician_id"
                                    value={values.technician_id}
                                    options={technicianOptions}
                                    onChange={(e) => setFieldValue("technician_id", e.target.value)}
                                    error={touched.technician_id && errors.technician_id}
                                />
                                <ErrorMessage
                                    name="technician_id"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    required
                                    label="CT Status"
                                    name="ct_status"
                                    value={values.ct_status}
                                    options={[
                                        { value: "1", label: "Same Outlet" },
                                        { value: "0", label: "Missmatch Outlet" },
                                    ]}
                                    onChange={(e) => setFieldValue("ct_status", e.target.value)}
                                    error={touched.ct_status && errors.ct_status}
                                />
                                <ErrorMessage
                                    name="ct_status"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="CTS Comment"
                                    name="cts_comment"
                                    value={values.cts_comment}
                                    onChange={(e) => setFieldValue("cts_comment", e.target.value)}
                                />
                                <ErrorMessage
                                    name="cts_comment"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>


                        </div>
                    </ContainerCard>
                );

            case 3:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <InputFields
                                    label="Chiller"
                                    name="chiller_id"
                                    options={chillerOptions}
                                    value={values.chiller_id}
                                    onChange={(e) => {
                                        setFieldValue("chiller_id", e.target.value);

                                        // Auto-fill chiller details
                                        const selectedChiller = chillers.find(
                                            (c) => String(c.id) === e.target.value
                                        );

                                        if (selectedChiller) {
                                            setFieldValue("asset_no", selectedChiller.assets_type || "");
                                            setFieldValue("serial_no", selectedChiller.serial_number || "");
                                            setFieldValue("model_no", selectedChiller.model_number?.name || "");
                                            setFieldValue("branding", selectedChiller.branding?.name || "");
                                        }
                                    }}
                                />

                                <ErrorMessage
                                    name="chiller_id"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Model No."
                                    name="model_no"
                                    disabled
                                    value={values.model_no}
                                    onChange={(e) => setFieldValue("model_no", e.target.value)}
                                    error={touched.model_no && errors.model_no}
                                />
                                <ErrorMessage
                                    name="model_no"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Serial No."
                                    name="serial_no"
                                    disabled
                                    value={values.serial_no}
                                    onChange={(e) => setFieldValue("serial_no", e.target.value)}
                                    error={touched.serial_no && errors.serial_no}
                                />
                                <ErrorMessage
                                    name="serial_no"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Asset Type"
                                    name="asset_no"
                                    disabled
                                    value={values.asset_no}
                                    onChange={(e) => setFieldValue("asset_no", e.target.value)}
                                    error={touched.asset_no && errors.asset_no}
                                />
                                <ErrorMessage
                                    name="asset_no"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Branding"
                                    name="branding"
                                    disabled
                                    value={values.branding}
                                    onChange={(e) => setFieldValue("branding", e.target.value)}
                                    error={touched.branding && errors.branding}
                                />
                                <ErrorMessage
                                    name="branding"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                        </div>
                    </ContainerCard>

                );
            case 4:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputFields
                                    label="Nature of Call"
                                    name="nature_of_call_id"
                                    value={values.nature_of_call_id}
                                    onChange={(e) => setFieldValue("nature_of_call_id", e.target.value)}
                                />
                                <ErrorMessage
                                    name="nature_of_call_id"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Current Voltage"
                                    name="current_voltage"
                                    value={values.current_voltage}
                                    onChange={(e) => setFieldValue("current_voltage", e.target.value)}
                                />
                                <ErrorMessage
                                    name="current_voltage"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Amps"
                                    name="amps"
                                    value={values.amps}
                                    onChange={(e) => setFieldValue("amps", e.target.value)}
                                />
                                <ErrorMessage
                                    name="amps"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Cabin Temperature"
                                    name="cabin_temperature"
                                    value={values.cabin_temperature}
                                    onChange={(e) => setFieldValue("cabin_temperature", e.target.value)}
                                />
                                <ErrorMessage
                                    name="cabin_temperature"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                        </div>
                    </ContainerCard>

                );

            case 5:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <InputFields
                                    label="Work Status"
                                    name="work_status"
                                    value={values.work_status}
                                    options={[
                                        { value: "1", label: "Active" },
                                        { value: "0", label: "Inactive" },
                                    ]}
                                    onChange={(e) => setFieldValue("work_status", e.target.value)}
                                />
                                <ErrorMessage
                                    name="work_status"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            {renderFileInput(
                                "type_details_photo1",
                                "Type Details Photo 1",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*,.pdf"
                            )}

                            {renderFileInput(
                                "type_details_photo2",
                                "Type Details Photo 2",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*,.pdf"
                            )}

                            <div>
                                <InputFields
                                    label="Technical Behaviour Rating"
                                    name="technical_behaviour"
                                    value={values.technical_behaviour}
                                    onChange={(e) => setFieldValue("technical_behaviour", e.target.value)}
                                />
                                <ErrorMessage
                                    name="technical_behaviour"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Service Quality Rating"
                                    name="service_quality"
                                    value={values.service_quality}
                                    onChange={(e) => setFieldValue("service_quality", e.target.value)}
                                />
                                <ErrorMessage
                                    name="service_quality"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            {renderFileInput(
                                "customer_signature",
                                "Customer Signature",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*,.pdf"
                            )}

                        </div>
                    </ContainerCard>
                );

            case 6:
                return (
                    <ContainerCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputFields
                                    label="Is Machine In Working"
                                    name="is_machine_in_working"
                                    value={values.is_machine_in_working}
                                    options={[
                                        { value: "1", label: "Yes" },
                                        { value: "0", label: "No" },
                                    ]}
                                    onChange={(e) => setFieldValue("is_machine_in_working", e.target.value)}
                                />
                                <ErrorMessage
                                    name="is_machine_in_working"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Cleanliness"
                                    name="cleanliness"
                                    value={values.cleanliness}
                                    options={[
                                        { value: "1", label: "Yes" },
                                        { value: "0", label: "No" },
                                    ]}
                                    onChange={(e) => setFieldValue("cleanliness", e.target.value)}
                                />
                                <ErrorMessage
                                    name="cleanliness"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Condensor Coil Cleaned"
                                    name="condensor_coil_cleand"
                                    value={values.condensor_coil_cleand}
                                    options={[
                                        { value: "1", label: "Yes" },
                                        { value: "0", label: "No" },
                                    ]}
                                    onChange={(e) => setFieldValue("condensor_coil_cleand", e.target.value)}
                                />
                                <ErrorMessage
                                    name="condensor_coil_cleand"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Gaskets"
                                    name="gaskets"
                                    value={values.gaskets}
                                    options={[
                                        { value: "1", label: "Yes" },
                                        { value: "0", label: "No" },
                                    ]}
                                    onChange={(e) => setFieldValue("gaskets", e.target.value)}
                                />
                                <ErrorMessage
                                    name="gaskets"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Light Working"
                                    name="light_working"
                                    value={values.light_working}
                                    options={[
                                        { value: "1", label: "Yes" },
                                        { value: "0", label: "No" },
                                    ]}
                                    onChange={(e) => setFieldValue("light_working", e.target.value)}
                                />
                                <ErrorMessage
                                    name="light_working"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Branding No"
                                    name="branding_no"
                                    value={values.branding_no}
                                    options={[
                                        { value: "1", label: "Yes" },
                                        { value: "0", label: "No" },
                                    ]}
                                    onChange={(e) => setFieldValue("branding_no", e.target.value)}
                                />
                                <ErrorMessage
                                    name="branding_no"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>
                            <div>
                                <InputFields
                                    label="Proper Ventilation Available"
                                    name="propper_ventilation_available"
                                    value={values.propper_ventilation_available}
                                    options={[
                                        { value: "1", label: "Yes" },
                                        { value: "0", label: "No" },
                                    ]}
                                    onChange={(e) => setFieldValue("propper_ventilation_available", e.target.value)}
                                />
                                <ErrorMessage
                                    name="propper_ventilation_available"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Leveling Positioning"
                                    name="leveling_positioning"
                                    value={values.leveling_positioning}
                                    options={[
                                        { value: "1", label: "Yes" },
                                        { value: "0", label: "No" },
                                    ]}
                                    onChange={(e) => setFieldValue("leveling_positioning", e.target.value)}
                                />
                                <ErrorMessage
                                    name="leveling_positioning"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            <div>
                                <InputFields
                                    label="Stock Availability In"
                                    name="stock_availability_in"
                                    value={values.stock_availability_in}
                                    options={[
                                        { value: "1", label: "Yes" },
                                        { value: "0", label: "No" },
                                    ]}
                                    onChange={(e) => setFieldValue("stock_availability_in", e.target.value)}
                                />
                                <ErrorMessage
                                    name="stock_availability_in"
                                    component="div"
                                    className="text-sm text-red-600 mb-1"
                                />
                            </div>

                            {renderFileInput(
                                "is_machine_in_working_img",
                                "Is Machine In Working",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*,.pdf"
                            )}

                            {renderFileInput(
                                "cleanliness_img",
                                "Cleanliness",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*,.pdf"
                            )}

                            {renderFileInput(
                                "condensor_coil_cleand_img",
                                "Condensor Coil Cleaned",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*,.pdf"
                            )}

                            {renderFileInput(
                                "stock_availability_in_img",
                                "Stock Availability In",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*,.pdf"
                            )}

                            {renderFileInput(
                                "cooler_image",
                                "Cooler",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*,.pdf"
                            )}

                            {renderFileInput(
                                "cooler_image2",
                                "Cooler 2",
                                values,
                                setFieldValue,
                                errors,
                                touched,
                                "image/*,.pdf"
                            )}


                        </div>
                    </ContainerCard>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/serviceVisit" back>
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? "Update Service Visit" : "Add Service Visit"}
                    </h1>
                </div>
            </div>

            <Formik
                initialValues={existingData || initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({
                    values,
                    setFieldValue,
                    errors,
                    touched,
                    setErrors,
                    setTouched,
                    isSubmitting: formikSubmitting,
                }) => (
                    <Form>
                        <StepperForm
                            steps={steps.map((step) => ({
                                ...step,
                                isCompleted: isStepCompleted(step.id),
                            }))}
                            currentStep={currentStep}
                            onStepClick={() => { }}
                            onBack={prevStep}
                            onNext={() =>
                                handleNext(values, {
                                    setErrors,
                                    setTouched,
                                } as unknown as FormikHelpers<ServiceVisit>)
                            }
                            onSubmit={() => handleSubmit(values)}
                            showSubmitButton={isLastStep}
                            showNextButton={!isLastStep}
                            nextButtonText="Save & Next"
                            submitButtonText={
                                isSubmitting
                                    ? isEditMode
                                        ? "Updating..."
                                        : "Submitting..."
                                    : isEditMode
                                        ? "Update"
                                        : "Submit"
                            }
                        >
                            {renderStepContent(values, setFieldValue, errors, touched)}
                        </StepperForm>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
