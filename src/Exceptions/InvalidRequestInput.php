<?php

namespace ChayseHartsuff\ActiveHtml\Exceptions;

use Exception;

class InvalidRequestInput extends Exception
{
	/**
	 * @var array<string, array<int, string>>
	 */
	private array $errors;

	/**
	 * @param array<string, array<int, string>> $errors
	 */
	public function __construct(array $errors = [], string $message = 'The given data was invalid.')
	{
		parent::__construct($message);
		$this->errors = $errors;
	}

	/**
	 * @return array<string, array<int, string>>
	 */
	public function errors(): array
	{
		return $this->errors;
	}
}
