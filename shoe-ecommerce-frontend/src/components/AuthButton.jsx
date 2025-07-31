export default function AuthButton({ text }) {
    return (
        <button
            type="submit"
            className="w-full py-2 font-semibold text-white transition rounded-md bg-primary hover:bg-accent"
        >
            {text}
        </button>
    )
}