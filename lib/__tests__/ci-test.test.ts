describe("GitHub Actions CI Test", () => {
  it("should pass this simple test", () => {
    expect(1 + 1).toBe(2)
  })

  it("should handle string operations", () => {
    expect("hello" + " world").toBe("hello world")
  })

  it("should work with arrays", () => {
    const array = [1, 2, 3]
    expect(array.length).toBe(3)
    expect(array.map((x) => x * 2)).toEqual([2, 4, 6])
  })
})
