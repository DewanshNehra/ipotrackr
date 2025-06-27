import React from "react";

export default function Footer() {
    return (
        <footer className="bg-[#1A1A1A] text-gray-400 py-4">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-sm">
                        &copy; {new Date().getFullYear()} Data provided by <a href="https://www.investorgain.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">InvestorGain</a>
                    </div>
                    <div className="flex flex-col items-center sm:items-end gap-2 mt-2 sm:mt-0">
                        <a href="https://github.com/Dewanshnehra/ipotrackr" target="_blank" rel="noopener noreferrer">
                            Made by: Dewans Nehra
                        </a>
                        <div className="text-sm"></div>
                        
                    </div>
                </div>
            </div>
        </footer>
    );
}