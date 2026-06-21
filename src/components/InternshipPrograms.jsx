import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { getPrograms, submitApplication } from "../services/api";

import { validateApplicationForm } from "../utils/validation";

import { inputClass } from "../utils/themeClasses";

import FormField from "./FormField";

import ProgramIcon from "./ProgramIcon";

import { useNavigate } from "react-router-dom";

const fallbackPrograms = [

  "Web Development",

  "Java Development",

  "Python Development",

  "AI & Machine Learning",

  "Data Science",

  "Cyber Security",

];



function InternshipPrograms() {
  const navigate = useNavigate();

  const [programs, setPrograms] = useState(

    fallbackPrograms.map((title) => ({

      title,

      description:

        "Hands-on projects, mentorship, certification, and practical learning experience.",

    }))

  );

  const [selectedProgram, setSelectedProgram] = useState(null);

  const [formData, setFormData] = useState({

    fullName: "",

    email: "",

    phone: "",

    message: "",

  });

  const [fieldErrors, setFieldErrors] = useState({});

  const [status, setStatus] = useState({ type: "", message: "" });

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    getPrograms()

      .then((result) => {

        if (result.data?.length) {

          setPrograms(result.data);

        }

      })

      .catch(() => {});

  }, []);



  const openModal = (program) => {

    setSelectedProgram(program);

    setFormData({ fullName: "", email: "", phone: "", message: "" });

    setFieldErrors({});

    setStatus({ type: "", message: "" });

  };



  const closeModal = () => {

    setSelectedProgram(null);

    setFieldErrors({});

    setStatus({ type: "", message: "" });

  };



  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (fieldErrors[name]) {

      setFieldErrors({ ...fieldErrors, [name]: "" });

    }

  };



  const handleSubmit = async (e) => {

    e.preventDefault();



    const errors = validateApplicationForm(formData);

    if (Object.keys(errors).length > 0) {

      setFieldErrors(errors);

      setStatus({ type: "error", message: "Please fix the errors below" });

      return;

    }



    setLoading(true);

    setStatus({ type: "", message: "" });

    setFieldErrors({});



    try {

      const result = await submitApplication({

        ...formData,

        program: selectedProgram.title,

      });

      setStatus({ type: "success", message: result.message });

      setFormData({ fullName: "", email: "", phone: "", message: "" });

    } catch (error) {

      setFieldErrors(error.errors || {});

      setStatus({ type: "error", message: error.message });

    } finally {

      setLoading(false);

    }

  };



  return (

    <section className="theme-section">

      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">

          <p className="theme-label mb-4">INTERNSHIP PROGRAMS</p>

          <h2 className="theme-heading">Gain Real-World Experience</h2>

          <p className="mt-6 text-lg text-muted max-w-3xl mx-auto">

            Explore industry-focused internship opportunities designed

            to help students build practical skills and professional confidence.

          </p>

        </div>



        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {programs.map((program, index) => (

            <div

              key={program._id || index}

              className="theme-card theme-card-hover p-8"

            >

              <div className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center mb-5">

                <ProgramIcon title={program.title} className="w-9 h-9" />

              </div>



              <h3 className="text-2xl font-medium text-fg mb-4">

                {program.title}

              </h3>



              <p className="text-muted mb-6">{program.description}</p>



              <button

                onClick={() =>
  navigate(
    `/internship/apply/${encodeURIComponent(program.title)}`
  )
}

                className="theme-btn-primary px-5 py-3"

              >

                Apply Now

              </button>

            </div>

          ))}

        </div>

      </div>



      {selectedProgram && (

        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay px-4">

          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">

            <button

              onClick={closeModal}

              className="absolute top-4 right-4 text-muted hover:text-fg"

            >

              <X size={24} />

            </button>



            <div className="flex items-center gap-4 mb-2">

              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">

                <ProgramIcon title={selectedProgram.title} className="w-7 h-7" />

              </div>

              <h3 className="text-2xl font-medium text-fg">

                Apply for {selectedProgram.title}

              </h3>

            </div>



            <p className="text-muted mb-6">

              Fill in your details and we will get back to you soon.

            </p>



            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              <FormField error={fieldErrors.fullName}>

                <input

                  type="text"

                  name="fullName"

                  value={formData.fullName}

                  onChange={handleChange}

                  placeholder="Full Name"

                  className={inputClass(fieldErrors.fullName)}

                />

              </FormField>



              <FormField error={fieldErrors.email}>

                <input

                  type="email"

                  name="email"

                  value={formData.email}

                  onChange={handleChange}

                  placeholder="Email Address"

                  className={inputClass(fieldErrors.email)}

                />

              </FormField>



              <FormField error={fieldErrors.phone}>

                <input

                  type="tel"

                  name="phone"

                  value={formData.phone}

                  onChange={handleChange}

                  placeholder="Phone Number (10 digits)"

                  className={inputClass(fieldErrors.phone)}

                />

              </FormField>



              <FormField error={fieldErrors.message}>

                <textarea

                  name="message"

                  value={formData.message}

                  onChange={handleChange}

                  rows="4"

                  placeholder="Why do you want to join? (optional)"

                  className={inputClass(fieldErrors.message)}

                ></textarea>

              </FormField>



              {status.message && (

                <p

                  className={

                    status.type === "success"

                      ? "text-green-400 text-sm"

                      : "text-red-400 text-sm"

                  }

                >

                  {status.message}

                </p>

              )}



              <button

                type="submit"

                disabled={loading}

                className="w-full theme-btn-primary disabled:opacity-60 disabled:cursor-not-allowed py-4 font-medium"

              >

                {loading ? "Submitting..." : "Submit Application"}

              </button>

            </form>

          </div>

        </div>

      )}

    </section>

  );

}



export default InternshipPrograms;

