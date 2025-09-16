"use client";

import { useState, useEffect, useMemo } from "react";
import Counter from "./Counter";
import Button from "@/components/ui/Button";

interface WordFindGameProps {
  targetWord: string;
  onComplete: () => void;
  index: number;
  cardsLength: number;
  isActive: boolean;
}

export default function WordFindGame({
  targetWord,
  onComplete,
  index,
  cardsLength,
  isActive,
}: WordFindGameProps) {
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [foundWord, setFoundWord] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [lives, setLives] = useState(4);
  const [gameStatus, setGameStatus] = useState<
    "playing" | "won" | "lost" | "roundWon"
  >("playing");
  const [currentRound, setCurrentRound] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<number | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [incorrectCell, setIncorrectCell] = useState<number | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("WordFindGame - targetWord:", targetWord);
    console.log("WordFindGame - gameStatus:", gameStatus);
  }, [targetWord, gameStatus]);

  // Reset game when becoming active
  useEffect(() => {
    if (isActive) {
      setSelectedCells([]);
      setFoundWord("");
      setTimeLeft(30);
      setLives(4);
      setGameStatus("playing");
      setCurrentRound(1);
    }
  }, [isActive]);

  // Get grid size based on round
  const getGridSize = () => {
    switch (currentRound) {
      case 1:
        return 4; // 4x4
      case 2:
        return 6; // 6x6
      case 3:
        return 8; // 8x8
      default:
        return 4;
    }
  };

  const gridSize = getGridSize();
  const totalCells = gridSize * gridSize;

  // Generate grid with random letters and target word placed randomly
  const gridData = useMemo(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const grid = Array(totalCells)
      .fill("")
      .map(() => letters[Math.floor(Math.random() * letters.length)]);

    // Function to place word with smart wrapping
    const placeWordInGrid = (word: string) => {
      const wordLength = word.length;

      // Create all possible strategies
      const horizontalStrategy = () => {
        // Try to fit word completely in one row first
        if (wordLength <= gridSize) {
          const validRows = [];
          for (let row = 0; row < gridSize; row++) {
            for (
              let startCol = 0;
              startCol <= gridSize - wordLength;
              startCol++
            ) {
              validRows.push({ row, startCol });
            }
          }

          if (validRows.length > 0) {
            const { row, startCol } =
              validRows[Math.floor(Math.random() * validRows.length)];
            for (let i = 0; i < wordLength; i++) {
              const index = row * gridSize + (startCol + i);
              grid[index] = word[i];
            }
            return true;
          }
        }

        // Fallback: Horizontal with wrapping
        const startRow = Math.floor(Math.random() * gridSize);
        const startCol = Math.floor(Math.random() * gridSize);
        let row = startRow;
        let col = startCol;

        for (let i = 0; i < wordLength; i++) {
          const index = row * gridSize + col;
          grid[index] = word[i];

          col++;
          if (col >= gridSize && i < wordLength - 1) {
            col = 0;
            row = (row + 1) % gridSize;
          }
        }
        return true;
      };

      const verticalStrategy = () => {
        // Try to fit word completely in one column first
        if (wordLength <= gridSize) {
          const validCols = [];
          for (let col = 0; col < gridSize; col++) {
            for (
              let startRow = 0;
              startRow <= gridSize - wordLength;
              startRow++
            ) {
              validCols.push({ col, startRow });
            }
          }

          if (validCols.length > 0) {
            const { col, startRow } =
              validCols[Math.floor(Math.random() * validCols.length)];
            for (let i = 0; i < wordLength; i++) {
              const index = (startRow + i) * gridSize + col;
              grid[index] = word[i];
            }
            return true;
          }
        }

        // Fallback: Vertical with wrapping
        const startRow = Math.floor(Math.random() * gridSize);
        const startCol = Math.floor(Math.random() * gridSize);
        let row = startRow;
        let col = startCol;

        for (let i = 0; i < wordLength; i++) {
          const index = row * gridSize + col;
          grid[index] = word[i];

          row++;
          if (row >= gridSize && i < wordLength - 1) {
            row = 0;
            col = (col + 1) % gridSize;
          }
        }
        return true;
      };

      // Randomly choose between horizontal and vertical placement
      const allStrategies =
        Math.random() < 0.5
          ? [horizontalStrategy, verticalStrategy]
          : [verticalStrategy, horizontalStrategy];

      // Try strategies in order
      for (const strategy of allStrategies) {
        if (strategy()) {
          break; // Stop once word is successfully placed
        }
      }
    };

    placeWordInGrid(targetWord);
    return grid;
  }, [targetWord, totalCells, gridSize]);

  // Timer countdown - only runs when game is active
  useEffect(() => {
    if (gameStatus === "playing" && timeLeft > 0 && isActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStatus === "playing" && isActive) {
      // Restart current round when time runs out
      setSelectedCells([]);
      setFoundWord("");
      setTimeLeft(30);
      setLives((prev) => prev - 1);

      // Game over only when no lives left
      if (lives <= 1) {
        setGameStatus("lost");
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }
  }, [timeLeft, gameStatus, isActive, lives, onComplete]);

  // Check if current selection is valid (matches target word sequence)
  const isValidSelection = (newSelectedCells: number[]) => {
    const selectedWord = newSelectedCells.map((i) => gridData[i]).join("");
    return targetWord.startsWith(selectedWord);
  };

  // Handle invalid selection (wrong letter)
  const handleInvalidSelection = (invalidCellIndex: number) => {
    // Block further selections and show incorrect cell
    setIsBlocked(true);
    setIncorrectCell(invalidCellIndex);

    // Add incorrect letter to display
    const newSelected = [...selectedCells, invalidCellIndex];
    setSelectedCells(newSelected);
    setFoundWord(newSelected.map((i) => gridData[i]).join(""));

    setLives((prev) => prev - 1);
    setTimeLeft(30); // Reset timer

    // Unblock and clear incorrect feedback after 1 second
    setTimeout(() => {
      setIsBlocked(false);
      setIncorrectCell(null);
      setSelectedCells([]);
      setFoundWord("");
    }, 1000);

    // Game over only when no lives left
    if (lives <= 1) {
      setGameStatus("lost");
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  // Check for game completion
  useEffect(() => {
    if (
      foundWord.length > 0 &&
      foundWord === targetWord &&
      gameStatus === "playing"
    ) {
      // Play success sound with delay
      setTimeout(() => {
        const audio = new Audio("/success.mp3");
        audio.play().catch((error) => {
          console.log("Could not play audio:", error);
        });
      }, 300);

      if (currentRound < 3) {
        setTimeout(() => {
          setGameStatus("roundWon");
        }, 1000);
      } else {
        setTimeout(() => {
          setGameStatus("won");
        }, 1000);
      }
    }
  }, [foundWord, targetWord, gameStatus, currentRound]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent, cellIndex: number) => {
    if (gameStatus !== "playing" || isBlocked) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStartCell(cellIndex);

    // Add to existing selection instead of replacing
    if (!selectedCells.includes(cellIndex)) {
      const newSelected = [...selectedCells, cellIndex];

      // Check if selection is valid
      if (isValidSelection(newSelected)) {
        setSelectedCells(newSelected);
        setFoundWord(newSelected.map((i) => gridData[i]).join(""));
      } else {
        // Invalid selection - restart round
        handleInvalidSelection(cellIndex);
        setIsDragging(false);
        setDragStartCell(null);
      }
    }
  };

  // Handle drag over
  const handleMouseEnter = (e: React.MouseEvent, cellIndex: number) => {
    if (!isDragging || gameStatus !== "playing" || isBlocked) return;

    e.preventDefault();
    e.stopPropagation();

    if (!selectedCells.includes(cellIndex)) {
      const newSelected = [...selectedCells, cellIndex];

      // Check if selection is valid
      if (isValidSelection(newSelected)) {
        setSelectedCells(newSelected);
        setFoundWord(newSelected.map((i) => gridData[i]).join(""));
      } else {
        // Invalid selection - restart round
        handleInvalidSelection(cellIndex);
        setIsDragging(false);
        setDragStartCell(null);
      }
    }
  };

  // Handle drag end
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    setDragStartCell(null);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent, cellIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (gameStatus !== "playing" || isBlocked) return;

    setIsDragging(true);
    setDragStartCell(cellIndex);

    // Handle both selection and deselection like click
    if (selectedCells.includes(cellIndex)) {
      // Deselect cell
      const newSelected = selectedCells.filter((i) => i !== cellIndex);
      setSelectedCells(newSelected);
      setFoundWord(newSelected.map((i) => gridData[i]).join(""));
    } else {
      // Select cell
      const newSelected = [...selectedCells, cellIndex];

      // Check if selection is valid
      if (isValidSelection(newSelected)) {
        setSelectedCells(newSelected);
        setFoundWord(newSelected.map((i) => gridData[i]).join(""));
      } else {
        // Invalid selection - restart round
        handleInvalidSelection(cellIndex);
        setIsDragging(false);
        setDragStartCell(null);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || gameStatus !== "playing" || isBlocked) return;

    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.getAttribute("data-cell-index")) {
      const cellIndex = parseInt(element.getAttribute("data-cell-index")!);
      if (!selectedCells.includes(cellIndex)) {
        const newSelected = [...selectedCells, cellIndex];

        // Check if selection is valid
        if (isValidSelection(newSelected)) {
          setSelectedCells(newSelected);
          setFoundWord(newSelected.map((i) => gridData[i]).join(""));
        } else {
          // Invalid selection - restart round
          handleInvalidSelection(cellIndex);
          setIsDragging(false);
          setDragStartCell(null);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    setDragStartCell(null);
  };

  // Handle cell selection
  const handleCellClick = (cellIndex: number) => {
    console.log("Cell clicked:", cellIndex, "Game status:", gameStatus);
    if (gameStatus !== "playing" || isDragging || isBlocked) {
      console.log("Game not playing, dragging, or blocked - click ignored");
      return;
    }

    if (selectedCells.includes(cellIndex)) {
      // Deselect cell
      const newSelected = selectedCells.filter((i) => i !== cellIndex);
      setSelectedCells(newSelected);
      setFoundWord(newSelected.map((i) => gridData[i]).join(""));
    } else {
      // Select cell
      const newSelected = [...selectedCells, cellIndex];

      // Check if selection is valid
      if (isValidSelection(newSelected)) {
        setSelectedCells(newSelected);
        setFoundWord(newSelected.map((i) => gridData[i]).join(""));
      } else {
        // Invalid selection - restart round
        handleInvalidSelection(cellIndex);
      }
    }
  };

  // Handle next level
  const handleNextLevel = () => {
    setCurrentRound(currentRound + 1);
    setSelectedCells([]);
    setFoundWord("");
    setTimeLeft(30);
    setGameStatus("playing");
  };

  // Handle restart game
  const handleRestart = () => {
    setSelectedCells([]);
    setFoundWord("");
    setTimeLeft(30);
    setLives(4);
    setGameStatus("playing");
    setCurrentRound(1);
    setIsBlocked(false);
    setIncorrectCell(null);
  };

  // Handle finish game
  const handleFinishGame = () => {
    onComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Don't render if no target word
  if (!targetWord || targetWord.trim() === "") {
    return (
      <div className="flex flex-col w-full h-full px-4 items-center justify-center">
        <p className="text-white text-center">
          Please select a word to start the game
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-7">
        {/* Timer */}
        <div className="text-white text-lg font-mono">
          {formatTime(timeLeft)}/30:00
        </div>

        {/* Lives */}
        <div className="flex gap-1 bg-black/20 rounded-full px-3 py-1">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="text-lg">
              {i < lives ? "❤️" : "🖤"}
            </span>
          ))}
        </div>
      </div>

      {/* Round and Target Word Display */}
      <div className="text-center">
        <div className="flex justify-center gap-2">
          {Array.from({ length: targetWord.length }, (_, i) => {
            const isCorrectMatch = foundWord[i] === targetWord[i];
            const isIncorrectLetter =
              incorrectCell !== null &&
              foundWord[i] &&
              !isCorrectMatch;

            return (
              <div
                key={i}
                className={`border-2 bg-[#FFFFFF0A] rounded-[4px] flex items-center justify-center font-medium ${
                  isIncorrectLetter
                    ? "border-[#F97066] text-[#F97066]"
                    : isCorrectMatch
                    ? "border-[#B2FF8B] text-white"
                    : "border-[#FFFFFF4D] text-white"
                } ${
                  targetWord.length >= 8
                    ? "w-8 h-8 text-[30px]"
                    : "w-12 h-12 text-[48px]"
                }`}
              >
                {foundWord[i] || ""}
              </div>
            );
          })}
        </div>
        <p className="text-white text-[14px] leading-[20px] mt-2.5">
          Target Word: {targetWord}
        </p>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex flex-col items-center mt-10">
        <div
          className={`grid rounded-2xl mb-4 ${
            isBlocked ? "pointer-events-none opacity-75" : ""
          }`}
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width:
              gridSize === 4 ? "320px" : gridSize === 6 ? "360px" : "400px",
            height:
              gridSize === 4 ? "320px" : gridSize === 6 ? "360px" : "400px",
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          {gridData.map((letter, index) => {
            const isSelected = selectedCells.includes(index);
            const isIncorrect = incorrectCell === index;
            const isCorrectLetter = targetWord.includes(letter);
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;

            const topSelected =
              row > 0 && selectedCells.includes(index - gridSize);
            const bottomSelected =
              row < gridSize - 1 && selectedCells.includes(index + gridSize);
            const leftSelected = col > 0 && selectedCells.includes(index - 1);
            const rightSelected =
              col < gridSize - 1 && selectedCells.includes(index + 1);

            let borderStyles: Record<string, string> = {};
            let shadowStyle: Record<string, string> = {};
            let borderRadius: Record<string, string> = {};

            if (isSelected) {
              const borderColor = isIncorrect ? "#FF4444" : "#B2FF8B";

              borderStyles = {
                borderTopWidth: topSelected ? "0px" : "1px",
                borderBottomWidth: bottomSelected ? "0px" : "1px",
                borderLeftWidth: leftSelected ? "0px" : "1px",
                borderRightWidth: rightSelected ? "0px" : "1px",
                borderTopColor: borderColor,
                borderBottomColor: borderColor,
                borderLeftColor: borderColor,
                borderRightColor: borderColor,
              };

              // Add shadow only on external edges
              const shadows = [];
              const shadowColor = isIncorrect ? "#FF4444" : "#B2FF8B";

              if (!topSelected) {
                shadows.push(`0 -2px 2px -1px ${shadowColor}`);
              }
              if (!bottomSelected) {
                shadows.push(`0 2px 2px -1px ${shadowColor}`);
              }
              if (!leftSelected) {
                shadows.push(`-2px 0 2px -1px ${shadowColor}`);
              }
              if (!rightSelected) {
                shadows.push(`2px 0 2px -1px ${shadowColor}`);
              }

              if (shadows.length > 0) {
                shadowStyle = { boxShadow: shadows.join(", ") };
              }

              // Add border radius on corners (4px for selection, 8px for grid corners)
              borderRadius = {
                borderTopLeftRadius:
                  !topSelected && !leftSelected ? "4px" : "0px",
                borderTopRightRadius:
                  !topSelected && !rightSelected ? "4px" : "0px",
                borderBottomLeftRadius:
                  !bottomSelected && !leftSelected ? "4px" : "0px",
                borderBottomRightRadius:
                  !bottomSelected && !rightSelected ? "4px" : "0px",
              };
            }

            const isTopLeft = row === 0 && col === 0;
            const isTopRight = row === 0 && col === gridSize - 1;
            const isBottomLeft = row === gridSize - 1 && col === 0;
            const isBottomRight = row === gridSize - 1 && col === gridSize - 1;

            if (isTopLeft) {
              borderRadius.borderTopLeftRadius = "8px";
            }
            if (isTopRight) {
              borderRadius.borderTopRightRadius = "8px";
            }
            if (isBottomLeft) {
              borderRadius.borderBottomLeftRadius = "8px";
            }
            if (isBottomRight) {
              borderRadius.borderBottomRightRadius = "8px";
            }

            return (
              <button
                key={index}
                data-cell-index={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCellClick(index);
                }}
                onMouseDown={(e) => handleMouseDown(e, index)}
                onMouseEnter={(e) => handleMouseEnter(e, index)}
                onMouseUp={handleMouseUp}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                disabled={gameStatus !== "playing" || isBlocked}
                className={`
                  aspect-square flex items-center justify-center font-medium
                  transition-all duration-200 border select-none
                  ${
                    isSelected
                      ? isIncorrect
                        ? "bg-[#000000DB] border-[#F97066] text-[#F97066] shadow-lg"
                        : `bg-[#000000DB] border-[#B2FF8B] ${
                            isCorrectLetter
                              ? "text-[#B2FF8B]"
                              : "text-[#FFFFFF80]"
                          } shadow-lg`
                      : foundWord.length === 0
                      ? "bg-[#0A0B1299] border-[#FFFFFF1A] text-white"
                      : "bg-[#0A0B1299] border-[#FFFFFF1A] text-[#FFFFFF80]"
                  }
                  ${isBlocked ? "cursor-not-allowed" : ""}
                `}
                style={{
                  touchAction: "none",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                  ...borderStyles,
                  ...shadowStyle,
                  ...borderRadius,
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      {gameStatus === "roundWon" && (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+18px)] z-[1000]">
          <div className="mx-auto w-full max-w-md px-4">
            <Button
              onClick={handleNextLevel}
              className="w-full h-[60px] rounded-[30px]"
            >
              Next Level
            </Button>
          </div>
        </div>
      )}

      {gameStatus === "won" && (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+18px)] z-[1000]">
          <div className="mx-auto w-full max-w-md px-4">
            <Button
              onClick={handleFinishGame}
              className="w-full h-[60px] rounded-[30px]"
            >
              Finish Game
            </Button>
          </div>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+18px)] z-[1000]">
          <div className="mx-auto w-full max-w-md px-4">
            <Button
              onClick={handleRestart}
              className="w-full h-[60px] rounded-[30px]"
            >
              Restart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
